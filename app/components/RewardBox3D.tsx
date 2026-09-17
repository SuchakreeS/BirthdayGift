"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/reward-box.glb";

// Total length of the model's three baked clips (lid opening, ticket
// border rising, ticket card rising/spinning) — the card settles last,
// around 3.96s in. Exported so RewardReveal can time the text overlay
// and "Continue" button off the same number instead of guessing.
export const REWARD_BOX_ANIMATION_MS = 3960;

function Model({ playing }: { playing: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // The box body mesh ("GiftBox_Body") has no material assigned in the
    // export — it falls back to three.js's plain-white default material,
    // which is why it rendered washed-out instead of wine-colored. Give
    // it a matching wine material at runtime rather than re-exporting the
    // .glb.
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.name === "GiftBox_Body") {
        obj.material = new THREE.MeshStandardMaterial({
          color: "#6e2a3a", // --color-wine
          roughness: 0.55,
          metalness: 0.05,
        });
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!playing) return;
    // Play every clip in the file (lid + ticket border + ticket card)
    // together, once, and hold on the final open/settled pose.
    Object.values(actions).forEach((action) => {
      if (!action) return;
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
    });
  }, [playing, actions]);

  // The model's own pivot sits at its box's bottom (y=0), with the lid
  // open resting around y≈2.56 and glitter scattered up to y≈2 — shift
  // the whole group down so its vertical center lands near the origin,
  // matching the camera's default look-at target.
  return <primitive ref={group} object={scene} position={[0, -1.3, 0]} />;
}

useGLTF.preload(MODEL_URL);

export default function RewardBox3D({ playing }: { playing: boolean }) {
  return (
    <Canvas
      // Pulled back and widened so the fully-open lid + risen ticket
      // (which reach roughly y=1.3 above the recentered group) aren't
      // cropped at the top of the frame.
      camera={{ position: [0, 0.4, 4.6], fov: 38 }}
      dpr={[1, 2]}
      gl={{ alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} color="#fff3d6" />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#b08d4f" />
      <Environment preset="apartment" environmentIntensity={0.5} />
      <Model playing={playing} />
    </Canvas>
  );
}
