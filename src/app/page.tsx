'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
        // Store token and redirect based on role
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FDS</h1>
          <p className="text-gray-600">Fund Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>লগইন করুন</CardTitle>
            <CardDescription>আপনার ইমেল এবং পাসওয়ার্ড দিয়ে লগইন করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="member" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="member">সদস্য</TabsTrigger>
                <TabsTrigger value="accountant">হিসাবরক্ষক</TabsTrigger>
              </TabsList>
              
              <TabsContent value="member" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="member-email">ইমেল</Label>
                  <Input
                    id="member-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-password">পাসওয়ার্ড</Label>
                  <Input
                    id="member-password"
                    type="password"
                    placeholder="পাসওয়ার্ড"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleLogin('MEMBER')}
                  disabled={isLoading}
                >
                  {isLoading ? 'লগইন হচ্ছে...' : 'সদস্য হিসেবে লগইন'}
                </Button>
              </TabsContent>
              
              <TabsContent value="accountant" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountant-email">ইমেল</Label>
                  <Input
                    id="accountant-email"
                    type="email"
                    placeholder="accountant@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountant-password">পাসওয়ার্ড</Label>
                  <Input
                    id="accountant-password"
                    type="password"
                    placeholder="পাসওয়ার্ড"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleLogin('ACCOUNTANT')}
                  disabled={isLoading}
                >
                  {isLoading ? 'লগইন হচ্ছে...' : 'হিসাবরক্ষক হিসেবে লগইন'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}