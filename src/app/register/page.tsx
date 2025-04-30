"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from 'next/link';
import { registerUser } from '@/actions/auth'; // Import server action
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

const registerSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(20, { message: "Username must be at most 20 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
});


type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
        // Omit confirmPassword before sending to the server action
        const { confirmPassword, ...userData } = data;
        const result = await registerUser(userData); // Call server action

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "You can now log in with your new account.",
        });
        router.push('/login'); // Redirect to login page
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Could not register. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
       console.error("Registration error:", error);
      toast({
        title: "An Error Occurred",
        description: "Something went wrong during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
           <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <UserPlus /> Create your Biterush Account
            </CardTitle>
          <CardDescription>Fill in the details below to register.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                 control={form.control}
                 name="username"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Username</FormLabel>
                     <FormControl>
                       <Input placeholder="Choose a username" {...field} disabled={isLoading} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary hover:text-primary/80">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
