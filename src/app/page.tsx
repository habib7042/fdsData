'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, User, Shield, Lock } from 'lucide-react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('member')

  const handleLogin = async (role: 'ACCOUNTANT' | 'MEMBER') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('fds-token', data.token)
        localStorage.setItem('fds-role', role)
        
        if (role === 'ACCOUNTANT') {
          window.location.href = '/accountant'
        } else {
          window.location.href = '/member'
        }
      } else {
        alert('Login failed. Please check your credentials.')
      }
    } catch (error) {
      alert('An error occurred during login.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen metallic-bg flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl metallic-card mb-4 animate-pulse-glow">
            <Shield className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">FDS</h1>
          <p className="text-indigo-200 text-lg">Fund Management System</p>
        </div>
        
        <Card className="metallic-card animate-fade-in" style={{animationDelay: '0.2s'}}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="member" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Member
                </TabsTrigger>
                <TabsTrigger value="accountant" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Accountant
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="member" className="space-y-4 animate-slide-in">
                <div className="space-y-2">
                  <Label htmlFor="member-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="member-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="metallic-input pl-10"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="member-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="metallic-input pl-10 pr-10"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button 
                  className="w-full metallic-button text-white font-medium py-3"
                  onClick={() => handleLogin('MEMBER')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    'Sign In as Member'
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="accountant" className="space-y-4 animate-slide-in">
                <div className="space-y-2">
                  <Label htmlFor="accountant-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="accountant-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="metallic-input pl-10"
                    />
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountant-password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="accountant-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="metallic-input pl-10 pr-10"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button 
                  className="w-full metallic-button text-white font-medium py-3"
                  onClick={() => handleLogin('ACCOUNTANT')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    'Sign In as Accountant'
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <div className="mt-6 text-center animate-fade-in" style={{animationDelay: '0.4s'}}>
          <p className="text-indigo-200 text-sm mb-2">Demo Credentials</p>
          <div className="glass rounded-lg p-3 text-xs text-indigo-100">
            <p><strong>Accountant:</strong> accountant@fds.com / accountant123</p>
            <p><strong>Member:</strong> john@fds.com / member123</p>
          </div>
        </div>
      </div>
    </div>
  )
}