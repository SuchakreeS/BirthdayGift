"use client";

import { useRef, useState } from "react";
import PinScreen from "./components/PinScreen";
import QuizScreen from "./components/QuizScreen";
import PhotoAlbum from "./components/PhotoAlbum";
import RewardReveal from "./components/RewardReveal";
import WishInput from "./components/WishInput";
import SongContinues from "./components/SongContinues";
import LetterPages from "./components/LetterPages";

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [albumDone, setAlbumDone] = useState(false);
  const [rewardDone, setRewardDone] = useState(false);
  const [wishDone, setWishDone] = useState(false);
  const [songMessageDone, setSongMessageDone] = useState(false);

  // Lives here (not inside PhotoAlbum) so the element — and its playback —
  // survives past the album screen instead of being torn down when that
  // component unmounts. Starts playing once the album step begins (see
  // PhotoAlbum) and just plays through to the end from there; no `loop`.
  const audioRef = useRef<HTMLAudioElement>(null);

  let step;
  if (!unlocked) {
    step = <PinScreen onUnlock={() => setUnlocked(true)} />;
  } else if (!quizDone) {
    step = <QuizScreen onComplete={() => setQuizDone(true)} />;
  } else if (!albumDone) {
    step = <PhotoAlbum audioRef={audioRef} onContinue={() => setAlbumDone(true)} />;
  } else if (!rewardDone) {
    step = <RewardReveal onContinue={() => setRewardDone(true)} />;
  } else if (!wishDone) {
    step = <WishInput onContinue={() => setWishDone(true)} />;
  } else if (!songMessageDone) {
    step = <SongContinues onContinue={() => setSongMessageDone(true)} />;
  } else {
    step = <LetterPages />;
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/two-is-better-than-one.mp3" />
      {step}
    </>
  );
}
