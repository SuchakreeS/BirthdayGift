"use client";

import { useState } from "react";
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

  if (!unlocked) {
    return <PinScreen onUnlock={() => setUnlocked(true)} />;
  }

  if (!quizDone) {
    return <QuizScreen onComplete={() => setQuizDone(true)} />;
  }

  if (!albumDone) {
    return <PhotoAlbum onContinue={() => setAlbumDone(true)} />;
  }

  if (!rewardDone) {
    return <RewardReveal onContinue={() => setRewardDone(true)} />;
  }

  if (!wishDone) {
    return <WishInput onContinue={() => setWishDone(true)} />;
  }

  if (!songMessageDone) {
    return <SongContinues onContinue={() => setSongMessageDone(true)} />;
  }

  return <LetterPages />;
}
