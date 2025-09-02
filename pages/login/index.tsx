import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DefaultLayout from "../../layouts/default";
import { Input } from "@heroui/input";
import React from "react";
import { Button } from "@heroui/button";
import { Alert } from "@heroui/alert";
import { account } from "@/lib/appwrite";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setAuthLoading, setCurrUid } from "@/store/appSlice";
export default function LoginPage() {
  const router = useRouter();
  const [emailValue, setEmailValue] = React.useState("");
  const [passwordValue, setPasswordValue] = React.useState("");
  const [isVisible, setIsVisible] = React.useState(false);
  const [error, setError] = React.useState("");
  const [resetPasswordVisible, setResetPasswordVisible] = React.useState(false);
  const dispatch = useDispatch();
  const { authLoading } = useSelector((state: RootState) => state.app);

  const signIn = async () => {
    dispatch(setAuthLoading(true));
    try {
      const session = await account.createEmailPasswordSession(
        emailValue,
        passwordValue
      );
      dispatch(setCurrUid(session.userId));
      dispatch(setAuthLoading(false));
      router.push("/");
    } catch (err) {
      setError("Invalid email or password");
      setIsVisible(true);
      dispatch(setAuthLoading(false));
      dispatch(setCurrUid(null));
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 align-middle pt-16">
        <h1>Login</h1>
        <Input
          className="max-w-xs pb-1"
          placeholder="Enter your email"
          value={emailValue}
          onValueChange={setEmailValue}
          label="Email"
          type="email"
          variant="bordered"
        />
        <Input
          className="max-w-xs pb-1"
          placeholder="Enter your password"
          value={passwordValue}
          onValueChange={setPasswordValue}
          label="Password"
          type="password"
          variant="bordered"
        />
        <Button
          color="primary"
          className="w-full max-w-xs text-background"
          onPress={() => signIn()}
        >
          Login
        </Button>

        <Alert
          className="flex justify-between px-1 max-w-xs"
          color="danger"
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        >
          {error}
        </Alert>
        <Alert
          className="flex justify-between px-1 max-w-xs"
          color="success"
          title="Password reset email sent"
          isVisible={resetPasswordVisible}
          onClose={() => setResetPasswordVisible(false)}
        />
      </section>
    </DefaultLayout>
  );
}
function setIsVisible(arg0: boolean) {
  throw new Error("Function not implemented.");
}
