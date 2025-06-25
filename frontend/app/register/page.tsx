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
import { Github, Mail, Code2, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const apiUrl = getApiUrl()
      await axios.post(`${apiUrl}/api/register`, { username, email, password })
      setIsSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000) // 2-second delay before redirecting
    } catch (err: any) {
      const errorMessage = err.response?.data?.msg || "An unexpected error occurred."
      setError(errorMessage)
    } finally {
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
            <CardTitle className="text-2xl">Create an Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {isSuccess ? (
              <div className="text-center p-8 flex flex-col items-center justify-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold text-gray-800">Registration Successful!</h3>
                <p className="text-gray-500 mt-2">Redirecting to login...</p>
              </div>
            ) : (
              <>
                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="h-11"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      className="h-11"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-0 flex h-full w-12 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="h-11 pr-12"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-1/2 right-0 flex h-full w-12 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground">
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
                  </Button>
                </form>

                <div className="text-xs text-gray-500 text-center">
                  By signing up, you agree to our{" "}
                  <button className="text-orange-600 hover:text-orange-500 font-medium">Terms of Service</button> and{" "}
                  <button className="text-orange-600 hover:text-orange-500 font-medium">Privacy Policy</button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {!isSuccess && (
          <div className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-600 hover:text-orange-500 font-medium">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
} 