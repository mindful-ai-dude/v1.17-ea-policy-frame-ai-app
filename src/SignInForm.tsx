import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData)
            .then(() => {
              toast.success(flow === "signIn" ? "Signed in successfully!" : "Account created successfully!");
              setSubmitting(false);
            })
            .catch((error) => {
              let toastTitle = "";
              if (error.message.includes("Invalid password")) {
                toastTitle = "Invalid password. Please try again.";
              } else {
                toastTitle =
                  flow === "signIn"
                    ? "Could not sign in, did you mean to sign up?"
                    : "Could not sign up, did you mean to sign in?";
              }
              toast.error(toastTitle);
              console.error("Auth error:", error);
              setSubmitting(false);
            });
        }}
      >
        <input
          className="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-200"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-200"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button 
          className="w-full px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold"
          type="submit" 
          disabled={submitting}
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="text-center text-sm">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-blue-500 hover:underline font-medium"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-200" />
        <span className="mx-4 text-gray-500">or</span>
        <hr className="my-4 grow border-gray-200" />
      </div>
      <button 
        className="w-full px-6 py-3 rounded-lg bg-gray-800 text-white font-semibold"
        onClick={() => {
          void signIn("anonymous")
            .then(() => {
              toast.success("Signed in anonymously!");
            })
            .catch((error) => {
              toast.error("Could not sign in anonymously");
              console.error("Anonymous auth error:", error);
            });
        }}
      >
        Sign in anonymously
      </button>
    </div>
  );
}