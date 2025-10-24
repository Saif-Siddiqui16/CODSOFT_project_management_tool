import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/hook";
import { verifyEmail, resetVerificationMessage } from "@/store/auth/auth-slice";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const token = searchParams.get("token");

  const { loading, verificationMessage, error } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (token) {
      dispatch(verifyEmail({ token }));
    }

    return () => {
      dispatch(resetVerificationMessage());
    };
  }, [token, dispatch]);

  const isVerifying = loading;
  const isSuccess =
    verificationMessage && verificationMessage.includes("success");
  const isError = !loading && (error || (!isSuccess && verificationMessage));

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-2">Verify Email</h1>
      <p className="text-sm text-gray-500 mb-6">
        {isVerifying
          ? "Verifying your email..."
          : "Please wait while we confirm your verification."}
      </p>

      <Card className="w-full max-w-md shadow-md">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            {isVerifying && (
              <>
                <Loader className="w-10 h-10 text-gray-500 animate-spin" />
                <h3 className="text-lg font-semibold">Verifying email...</h3>
                <p className="text-sm text-gray-500">
                  Please wait while we verify your email.
                </p>
              </>
            )}

            {isSuccess && (
              <>
                <CheckCircle className="w-10 h-10 text-green-500" />
                <h3 className="text-lg font-semibold">Email Verified</h3>
                <p className="text-sm text-gray-500 text-center">
                  Your email has been verified successfully.
                </p>
                <Link to="/sign-in" className="mt-4">
                  <Button variant="outline">Back to Sign in</Button>
                </Link>
              </>
            )}

            {isError && (
              <>
                <XCircle className="w-10 h-10 text-red-500" />
                <h3 className="text-lg font-semibold">
                  Email Verification Failed
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  {error || verificationMessage || "Please try again later."}
                </p>
                <Link to="/sign-in" className="mt-4">
                  <Button variant="outline">Back to Sign in</Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
