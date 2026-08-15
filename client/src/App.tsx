import { useEffect, useState } from "react";
import { useGame } from "./hooks/useGame";
import { ErrorCard } from "./components/ErrorCard";
import { HomePage } from "./pages/HomePage";
import { GamePage } from "./pages/GamePage";
import { ResultPage } from "./pages/ResultPage";
import { VictoryPage } from "./pages/VictoryPage";
const messages = ["Consultando conhecimentos inúteis...", "Criando uma pergunta suspeitamente específica...", "Pensando em números...", "Preparando a próxima discussão do casal..."];
export default function App() {
  const game = useGame(); const [message, setMessage] = useState(messages[0]);
  useEffect(()=>{ if(game.screen!=="loading") return; setMessage(messages[Math.floor(Math.random()*messages.length)]); const id=setInterval(()=>setMessage(messages[Math.floor(Math.random()*messages.length)]),2200); return()=>clearInterval(id); },[game.screen]);
  if(game.screen==="home") return <HomePage onStart={game.start}/>;
  if(game.screen==="loading") return <main className="relative z-10 flex min-h-screen items-center justify-center px-4">{game.error ? <ErrorCard message={game.error} onRetry={game.retry}/> : <div className="text-center"><div className="mx-auto mb-6 grid h-24 w-24 animate-float place-items-center rounded-[2rem] border-2 border-ink bg-white text-5xl shadow-pop">🤖</div><h1 className="text-2xl font-black">Preparando uma pergunta...</h1><p className="mt-2 font-bold text-ink/55">{message}</p><div className="mx-auto mt-6 h-2 w-48 overflow-hidden rounded-full bg-white"><div className="h-full w-1/2 animate-loader rounded-full bg-grape"/></div></div>}</main>;
  if(game.screen==="round" && game.question) return <GamePage players={game.players} question={game.question} round={game.roundNumber} turn={game.turn} guesses={game.guesses} error={game.error} onGuess={game.guess} onChallenge={game.challenge}/>;
  if(game.screen==="result" && game.question && game.reveal && game.loserId!==null) return <ResultPage players={game.players} question={game.question} reveal={game.reveal} challengerId={game.turn} loserId={game.loserId} onNext={game.nextRound}/>;
  if(game.screen==="victory") return <VictoryPage players={game.players} onReset={game.reset}/>;
  return null;
}
