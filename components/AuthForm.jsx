"use client"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import FormField from "@/components/FormField"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client";
import { signUp, signIn } from "@/lib/actions/auth.action"

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
     async function onSubmit(values) {
        console.log(values)
        try{
            if(type === "sign-in"){
                // sign in logic
                const {email, password} = values;
                const user = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await user.user.getIdToken();
                if(!idToken){
                    toast.error("User not found")
                    return;
                }
                const res = await signIn({
                    email: email,
                    idToken: idToken,
                })
                if(!res?.success){
                    toast.error(res?.message)
                    return
                }
                
                router.push("/")
                console.log("sign in")
                toast.success("Sign in successful")
            }
            else{
                // sign up logic
                const {name, email, password} = values;
                const user = await createUserWithEmailAndPassword(auth, email, password);
                const res = await signUp({
                    uid: user.user.uid,
                    name: name,
                    email: email,
                    password: password,
                })
                if(!res?.success){
                    toast.error(res?.message)
                    return
                }
                router.push("/sign-in")
                console.log("sign up")
                toast.success("Sign up successful, Please sign in")
            }
        }catch (error) {
            console.log(error);
            toast.error("Something went wrong.", error.message);
        }
      }
  
      const isSignIn = type === "sign-in"

    return (
        <div className = "card-border lg:min-w-[566px] bg-white">
            <div className="flex flex-col gap-6 card py-14 px-10 justify-center items-center">
                <div className="flex flex-row gap-2 justify-center items-center">
                    <Image src="/ai-tutor.png" alt="logo" width={50} height={50} />
                    <h1 className="text-primary-100 text-3xl">Tutorly</h1>
                </div>
                <h4> Your personalised ai-tutor</h4>
            
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form ">
                        {!isSignIn && <FormField control={form.control} name="name" label="Name" placeholder="Your Name" type="name"/>}
                        <FormField control={form.control} name="email" label="Email" placeholder="Enter your email" type="email"/> 
                        <FormField control={form.control} name="password" label="Password" placeholder="Enter your password" type="password"/>
                        <Button type="submit" className="relative w-full h-8 rounded-full bg-[linear-gradient(to_right,_#656565,_#ba5af6,_#472a85,_#5300a0,_#757575,_#656565)] bg-[length:200%] animate-gradient shadow-[0_0_15px_rgba(255,255,255,0.3)] py-6">
                            <div className="absolute inset-[3px] bg-black rounded-full flex justify-center items-center transition duration-500 ease-in-out hover:text-[#c55af6] text-white">{isSignIn ? 'Sign in':'Create an Account'}
                            </div></Button>
                    </form>
                </Form>
                <p className="text-center">{isSignIn ? 'No account yet ?':'Have an account already'}
                    <Link href = {isSignIn ? '/sign-up' : '/sign-in'} className="text-user-primary font-bold ml-1">
                        {isSignIn ? 'Sign up':'Sign in'}
                    </Link>
                </p>
            </div>
        </div>
  )
}

export default AuthForm