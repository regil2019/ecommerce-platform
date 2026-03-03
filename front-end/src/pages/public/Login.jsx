import { SignIn } from '@clerk/clerk-react';

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] bg-background">
      <div className="shadow-lg rounded-xl overflow-hidden">
        <SignIn routing="path" path="/login" />
      </div>
    </div>
  );
};

export default Login;
