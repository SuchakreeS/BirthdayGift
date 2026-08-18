"use client";

import { useState } from "react";
import PinScreen from "./components/PinScreen";
import QuizScreen from "./components/QuizScreen";
import PhotoAlbum from "./components/PhotoAlbum";
import RewardReveal from "./components/RewardReveal";
import WishInput from "./components/WishInput";
import SongContinues from "./components/SongContinues";
import LetterPages from "./components/LetterPages";
import MusicProvider from "./components/MusicProvider";

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

  // MusicProvider wraps every step from here on (not just the album) and
  // stays mounted across all of them — the song starts playing once she
  // reaches the album and keeps going through reward/wish/song-continues/
  // letters without restarting, since none of those steps unmount it.
  return (
    <MusicProvider>
      {!albumDone && <PhotoAlbum onContinue={() => setAlbumDone(true)} />}
      {albumDone && !rewardDone && (
        <RewardReveal onContinue={() => setRewardDone(true)} />
      )}
      {albumDone && rewardDone && !wishDone && (
        <WishInput onContinue={() => setWishDone(true)} />
      )}
      {albumDone && rewardDone && wishDone && !songMessageDone && (
        <SongContinues onContinue={() => setSongMessageDone(true)} />
      )}
      {albumDone && rewardDone && wishDone && songMessageDone && <LetterPages />}
    </MusicProvider>
  );
}
