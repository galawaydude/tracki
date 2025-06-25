"use client"

import { useState } from "react"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getApiUrl } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Github, Mail, Code2, Loader2, TriangleAlert, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token)
        
        toast.success("Login Successful!", {
          description: "Redirecting to your dashboard...",
          duration: 3000,
          closeButton: true,
        });

        toast("Password Recovery Notice", {
          description: "Please remember your password. We recommend periodically exporting your data as a backup.",
          duration: 15000,
          position: "top-center",
          icon: <TriangleAlert className="h-4 w-4 text-orange-500" />,
          closeButton: true,
        });

        router.push('/dashboard')
      } else {
        setError(data.msg || "An unknown error occurred.")
        toast.error("Login Failed", {
          description: data.msg || "Please check your credentials and try again.",
          closeButton: true,
        })
        setLoading(false)
      }
    } catch (err) {
      const errorMessage = "Failed to connect to the server. Please try again later."
      setError(errorMessage)
      toast.error("Connection Error", {
        description: errorMessage,
        closeButton: true,
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">Tracki</span>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <>
                {error && <p className="hidden">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-11"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="h-11 pr-12"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-0 flex h-full w-12 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </div>
                </form>
              </>
          </CardContent>
        </Card>

          <div className="text-center mt-6 text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-orange-600 hover:text-orange-500 font-medium">
              Sign up
            </Link>
          </div>
      </div>
    </div>
  )
} 