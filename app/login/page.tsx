import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "100px" }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
