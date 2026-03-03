import { SignUp } from '@clerk/clerk-react';

const Register = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] bg-background">
      <div className="shadow-lg rounded-xl overflow-hidden">
        <SignUp routing="path" path="/register" />
      </div>
    </div>
  );
};

export default Register;
