/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) {
      return <div>Loading...</div>;
    }
    try {
      await signUp.create({ emailAddress, password });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (e: any) {
      console.log(JSON.stringify(e, null, 2));
      setError(e.message[0].message);
    }
  }

  async function onPressVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) {
      return <div>Loading...</div>;
    }
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        setError("Verification failed");
        console.log(JSON.stringify(completeSignUp, null, 2));

        return;
      }

      if (completeSignUp.status === "complete") {
        await setActive({
          session: completeSignUp.createdSessionId,
        });
        router.push("/");
      }
    } catch (e: any) {
      setError(e.message[0].message);
    }
  }

  return <div>SignUp</div>;
};
export default SignUp;
