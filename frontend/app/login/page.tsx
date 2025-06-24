"use client"

import { useState } from "react"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Github, Mail, Code2, Loader2, CheckCircle, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"
      const response = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token)
        setIsSuccess(true)
        toast("Important: Password Recovery Disabled", {
          description: "Please remember your password. For security, we recommend periodically exporting your data as a CSV file.",
          duration: 15000,
          position: "top-center",
          icon: <TriangleAlert className="h-4 w-4" />,
          closeButton: true,
        });
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setError(data.msg)
        setLoading(false)
      }
    } catch (err) {
      setError("Failed to connect to the server.")
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
            {isSuccess ? (
              <div className="text-center p-8 flex flex-col items-center justify-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">Login Successful!</h3>
                <p className="text-gray-500 mt-2">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <>
                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}

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
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="h-11"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={loading || isSuccess}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isSuccess ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
                      {isSuccess ? "Success!" : "Sign In"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        {!isSuccess && (
          <div className="text-center mt-6 text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-orange-600 hover:text-orange-500 font-medium">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  )
} 