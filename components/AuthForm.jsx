"use client"
import FormField from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const authFormSchema = (type) =>{
    if(type === "sign-in"){
        return z.object({
            email: z.string().min(1, "Email is required").email("Invalid email"),
            password: z.string().min(6, "Password must be at least 6 characters"),
        })
    }
    else{
        return z.object({
            name: z.string().min(1, "Name is required"),
            email: z.string().min(1, "Email is required").email("Invalid email"),
            password: z.string().min(6, "Password must be at least 6 characters"),
        })
    }
}

const AuthForm = ({type}) => {
    const router = useRouter()
    const formSchema = authFormSchema(type)
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
      })
     
      // 2. Define a submit handler.
     async function onSubmit(data) {
        try{
            if(type === "sign-up"){
                // sign up logic
                const { name, email, password } = data;

                const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
                );

                const result = await signUp({
                uid: userCredential.user.uid,
                name: name || "",
                email,
                password,
                });

                if (!result.success) {
                toast.error(result.message);
                return;
                }

                toast.success("Account created successfully. Please sign in.");
                router.push("/sign-in");
            }
            else{
                // sign in logic
                const { email, password } = data;

                const userCredential = await signInWithEmailAndPassword(
                  auth,
                  email,
                  password
                );
        
                const idToken = await userCredential.user.getIdToken();
                if (!idToken) {
                  toast.error("Sign in Failed. Please try again.");
                  return;
                }
        
                await signIn({
                  email,
                  idToken,
                });
        
                toast.success("Signed in successfully.");
                router.push("/");
            }
        }catch (error) {
            console.log(error);
            toast.error("Something went wrong.", error.message);
        }
      }
  
      const isSignIn = type === "sign-in"

    return (
        <div className="card-border w-full max-w-[566px] bg-white">
            <div className="flex flex-col gap-4 sm:gap-6 card py-8 sm:py-14 px-4 sm:px-10 justify-center items-center">
                <div className="flex flex-row gap-2 justify-center items-center">
                    <Image src="/ai-tutor.png" alt="logo" width={40} height={40} className="size-[40px] sm:size-[50px]" />
                    <h1 className="text-primary-100 text-2xl sm:text-3xl">TutorlyAI</h1>
                </div>
                <h4 className="text-base sm:text-lg"> Your personalised ai-tutor</h4>
            
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4 sm:space-y-6 mt-2 sm:mt-4 form">
                        {!isSignIn && <FormField control={form.control} name="name" label="Name" placeholder="Your Name" type="name"/>}
                        <FormField control={form.control} name="email" label="Email" placeholder="Enter your email" type="email"/> 
                        <FormField control={form.control} name="password" label="Password" placeholder="Enter your password" type="password"/>
                        <Button type="submit" className="relative w-full h-8 rounded-full bg-[linear-gradient(to_right,_#656565,_#ba5af6,_#472a85,_#5300a0,_#757575,_#656565)] bg-[length:200%] animate-gradient shadow-[0_0_15px_rgba(255,255,255,0.3)] py-5 sm:py-6">
                            <div className="absolute inset-[3px] bg-black rounded-full flex justify-center items-center transition duration-500 ease-in-out hover:text-[#c55af6] text-white text-sm sm:text-base">
                                {isSignIn ? 'Sign in' : 'Create an Account'}
                            </div>
                        </Button>
                    </form>
                </Form>
                <p className="text-center text-sm sm:text-base">
                    {isSignIn ? 'No account yet ?' : 'Have an account already'}
                    <Link href={isSignIn ? '/sign-up' : '/sign-in'} className="text-user-primary font-bold ml-1">
                        {isSignIn ? 'Sign up' : 'Sign in'}
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default AuthForm