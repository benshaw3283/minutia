
import SignInForm from './SignInForm';

export default async function SignIn({ searchParams }: { searchParams: { error?: string; callbackUrl?: string } }) {
  const error = searchParams?.error;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignInForm error={error} />
    </div>
  );
}
