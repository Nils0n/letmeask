import logoImg from "../assets/images/logo.svg";
import { Button } from "../components/Button";
import { RoomCode } from "../components/RoomCode";
import { useParams } from "react-router-dom";

import "../styles/room.scss";
import { FormEvent, useEffect, useState } from "react";
import { useAuht } from "../hooks/useAuth";
import toast, { Toaster } from "react-hot-toast";
import { database } from "../services/firebase";
import { DataSnapshot, onValue, push, ref } from "firebase/database";

type RoomParams = {
  id: string;
};

type FirebaseQuestions = Record<
  string,
  {
    author: {
      name: string;
      avatar: string;
    };
    content: string;

    isHighLighted: boolean;
    isAnswered: boolean;
  }
>;

export function Room() {
  const { user } = useAuht();
  const { id } = useParams<RoomParams>();
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    return onValue(
      ref(database, `rooms/${id}`),
      (snapshot: DataSnapshot) => {
        const roomRef = snapshot.val();
        const firebaseQuestions: FirebaseQuestions = roomRef.questions ?? "";
        const parsedQuestions = Object.entries(firebaseQuestions).map(
          ([key, value]) => {
            console.log(value);
            return {
              id: key,
              content: value.content,
              author: value.author,
              isHighlighted: value.isHighLighted,
              isAnswered: value.isAnswered,
            };
          }
        );
        console.log(firebaseQuestions);
      },
      {
        onlyOnce: true,
      }
    );
  }, [id]);

  async function handleSendQuestion(event: FormEvent) {
    event.preventDefault();

    if (newQuestion.trim() === "") return;

    if (!user) toast.error("Você precisa está logado.");

    const question = {
      content: newQuestion,
      author: {
        name: user?.name,
        avatar: user?.avatar,
      },
      isHighLighted: false,
      isAnswered: false,
    };

    await push(ref(database, `rooms/${id}/questions`), question);

    toast.success("Pergunta enviada com sucesso.");
    setNewQuestion("");
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <RoomCode code={id} />
        </div>
      </header>
      <main>
        <div className="room-title">
          <h1>Sala React</h1>
          <span>4 perguntas</span>
        </div>
        <form onSubmit={handleSendQuestion}>
          <textarea
            placeholder="O que você quer perguntar"
            onChange={(event) => setNewQuestion(event.target.value)}
            value={newQuestion}
          />
          <div className="form-footer">
            {user ? (
              <div className="user-info">
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
              </div>
            ) : (
              <span>
                Para enviar uma pergunta, <button>faça seu login</button>.
              </span>
            )}

            <Button type="submit" disabled={!user}>
              Enviar pergunta
            </Button>
            <Toaster />
          </div>
        </form>
      </main>
    </div>
  );
}
