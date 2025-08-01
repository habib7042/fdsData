'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Member {
  id: string
  name: string
  email: string
  phone?: string
  monthlyAmount: number
  totalPaid: number
  totalDue: number
  isActive: boolean
  joinDate: string
}

interface Payment {
  id: string
  amount: number
  paymentMethod: 'BKASH' | 'NAGAD' | 'CASH'
  transactionId?: string
  notes?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  verifiedAt?: string
}

export default function MemberDashboard() {
  const [member, setMember] = useState<Member | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: '',
    transactionId: '',
    notes: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('fds-token')
    const role = localStorage.getItem('fds-role')
    
    if (!token || role !== 'MEMBER') {
      window.location.href = '/'
      return
    }

    fetchMemberData()
    fetchPaymentHistory()
  }, [])

  const fetchMemberData = async () => {
    try {
      const token = localStorage.getItem('fds-token')
      const response = await fetch('/api/member/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMember(data.member)
      }
    } catch (error) {
      console.error('Error fetching member data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('fds-token')
      const response = await fetch('/api/member/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Error fetching payment history:', error)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('fds-token')
      const response = await fetch('/api/member/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      })

      if (response.ok) {
        setShowPaymentForm(false)
        setPaymentData({ amount: '', paymentMethod: '', transactionId: '', notes: '' })
        fetchPaymentHistory()
        fetchMemberData()
        alert('Payment submitted successfully!')
      } else {
        alert('Failed to submit payment.')
      }
    } catch (error) {
      alert('An error occurred while submitting payment.')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!')
      return
    }
    
    try {
      const token = localStorage.getItem('fds-token')
      const response = await fetch('/api/member/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setShowPasswordForm(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        alert('Password changed successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to change password.')
      }
    } catch (error) {
      alert('An error occurred while changing password.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('fds-token')
    localStorage.removeItem('fds-role')
    window.location.href = '/'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">অনুমোদিত</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">অপেক্ষমান</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">প্রত্যাখ্যাত</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">লোড হচ্ছে...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FDS</h1>
              <span className="ml-4 text-gray-600">সদস্য ড্যাশবোর্ড</span>
            </div>
            <Button onClick={handleLogout} variant="outline">
              লগআউট
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            স্বাগতম, {member?.name}!
          </h2>
          <p className="text-gray-600">আপনার ফান্ডের হিসাব দেখুন এবং চাঁদা জমা দিন</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মাসিক চাঁদা</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{member?.monthlyAmount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট জমা</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">৳{member?.totalPaid}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">বকেয়া</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">৳{member?.totalDue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payments" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="payments">পেমেন্ট ইতিহাস</TabsTrigger>
              <TabsTrigger value="profile">প্রোফাইল</TabsTrigger>
              <TabsTrigger value="password">পাসওয়ার্ড পরিবর্তন</TabsTrigger>
            </TabsList>
            
            <Button onClick={() => setShowPaymentForm(true)}>
              নতুন পেমেন্ট জমা দিন
            </Button>
          </div>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>পেমেন্ট ইতিহাস</CardTitle>
                <CardDescription>আপনার সকল পেমেন্টের তালিকা</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">কোন পেমেন্ট পাওয়া যায়নি</p>
                  ) : (
                    payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">৳{payment.amount}</p>
                            <p className="text-sm text-gray-500">{payment.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              {new Date(payment.submittedAt).toLocaleDateString('bn-BD')}
                            </p>
                            {payment.transactionId && (
                              <p className="text-sm text-gray-500">TXN: {payment.transactionId}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>প্রোফাইল তথ্য</CardTitle>
                <CardDescription>আপনার ব্যক্তিগত তথ্য</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">নাম</Label>
                    <p className="text-lg">{member?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ইমেল</Label>
                    <p className="text-lg">{member?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ফোন</Label>
                    <p className="text-lg">{member?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">যোগদানের তারিখ</Label>
                    <p className="text-lg">
                      {member?.joinDate ? new Date(member.joinDate).toLocaleDateString('bn-BD') : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
                <CardDescription>আপনার পাসওয়ার্ড পরিবর্তন করুন</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <Button onClick={() => setShowPasswordForm(true)}>
                      পাসওয়ার্ড পরিবর্তন করুন
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>নতুন পেমেন্ট জমা দিন</CardTitle>
              <CardDescription>আপনার মাসিক চাঁদা জমা দিন</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount">পরিমাণ</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    placeholder="৳"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="paymentMethod">পেমেন্ট মেথড</Label>
                  <Select 
                    value={paymentData.paymentMethod} 
                    onValueChange={(value) => setPaymentData({...paymentData, paymentMethod: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="পেমেন্ট মেথড নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BKASH">বিকাশ</SelectItem>
                      <SelectItem value="NAGAD">নগদ</SelectItem>
                      <SelectItem value="CASH">ক্যাশ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(paymentData.paymentMethod === 'BKASH' || paymentData.paymentMethod === 'NAGAD') && (
                  <div>
                    <Label htmlFor="transactionId">ট্রানজেকশন আইডি</Label>
                    <Input
                      id="transactionId"
                      value={paymentData.transactionId}
                      onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                      placeholder="ট্রানজেকশন আইডি"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="notes">নোট (ঐচ্ছিক)</Label>
                  <Input
                    id="notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    placeholder="কোনো নোট থাকলে লিখুন"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    জমা দিন
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1"
                  >
                    বাতিল
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>পাসওয়ার্ড পরিবর্তন করুন</CardTitle>
              <CardDescription>আপনার নতুন পাসওয়ার্ড সেট করুন</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">বর্তমান পাসওয়ার্ড</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="বর্তমান পাসওয়ার্ড"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="নতুন পাসওয়ার্ড"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    পরিবর্তন করুন
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPasswordForm(false)}
                    className="flex-1"
                  >
                    বাতিল
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}