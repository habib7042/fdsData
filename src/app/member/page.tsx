'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingDown, 
  CreditCard, 
  Plus, 
  LogOut,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Settings,
  Wallet,
  History
} from 'lucide-react'

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
        return <Badge className="bg-green-100 text-green-800 metallic-badge">Approved</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 metallic-badge">Pending</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 metallic-badge">Rejected</Badge>
      default:
        return <Badge className="metallic-badge">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen metallic-bg flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-white mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen metallic-bg">
      {/* Header */}
      <header className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg metallic-card flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <h1 className="text-xl font-bold text-white">FDS</h1>
              </div>
              <span className="text-indigo-200">Member Dashboard</span>
            </div>
            <Button onClick={handleLogout} variant="outline" className="glass text-white border-white/20 hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome, {member?.name}!
          </h2>
          <p className="text-indigo-200">Manage your fund contributions and view payment history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="metallic-card animate-fade-in" style={{animationDelay: '0.1s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Contribution</CardTitle>
              <Wallet className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">৳{member?.monthlyAmount?.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="metallic-card animate-fade-in" style={{animationDelay: '0.2s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">৳{member?.totalPaid?.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="metallic-card animate-fade-in" style={{animationDelay: '0.3s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Amount Due</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">৳{member?.totalDue?.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payments" className="space-y-4">
          <div className="flex items-center justify-between animate-fade-in" style={{animationDelay: '0.4s'}}>
            <TabsList className="glass">
              <TabsTrigger value="payments" className="text-white hover:bg-white/10">Payment History</TabsTrigger>
              <TabsTrigger value="profile" className="text-white hover:bg-white/10">Profile</TabsTrigger>
              <TabsTrigger value="password" className="text-white hover:bg-white/10">Change Password</TabsTrigger>
            </TabsList>
            
            <Button onClick={() => setShowPaymentForm(true)} className="metallic-button text-white">
              <Plus className="w-4 h-4 mr-2" />
              Submit Payment
            </Button>
          </div>

          <TabsContent value="payments" className="space-y-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <Card className="metallic-card">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your complete payment transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {payments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No payments found</p>
                  ) : (
                    payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">৳{payment.amount.toLocaleString()}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">{payment.paymentMethod}</span>
                              {payment.transactionId && (
                                <span>TXN: {payment.transactionId}</span>
                              )}
                            </div>
                            {payment.notes && (
                              <p className="text-sm text-gray-500">Note: {payment.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(payment.submittedAt).toLocaleDateString()}</span>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Card className="metallic-card">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal and account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                        <p className="text-lg font-medium text-gray-900">{member?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                        <p className="text-lg font-medium text-gray-900">{member?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                        <p className="text-lg font-medium text-gray-900">{member?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Join Date</Label>
                        <p className="text-lg font-medium text-gray-900">
                          {member?.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 animate-fade-in" style={{animationDelay: '0.7s'}}>
            <Card className="metallic-card">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password for security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <Button onClick={() => setShowPasswordForm(true)} className="metallic-button text-white">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="metallic-card w-full max-w-md">
            <CardHeader>
              <CardTitle>Submit Payment</CardTitle>
              <CardDescription>Submit your monthly contribution</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    placeholder="Enter amount"
                    className="metallic-input"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={paymentData.paymentMethod} 
                    onValueChange={(value) => setPaymentData({...paymentData, paymentMethod: value})}
                  >
                    <SelectTrigger className="metallic-input">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BKASH">bKash</SelectItem>
                      <SelectItem value="NAGAD">Nagad</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(paymentData.paymentMethod === 'BKASH' || paymentData.paymentMethod === 'NAGAD') && (
                  <div>
                    <Label htmlFor="transactionId">Transaction ID</Label>
                    <Input
                      id="transactionId"
                      value={paymentData.transactionId}
                      onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                      placeholder="Enter transaction ID"
                      className="metallic-input"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    placeholder="Add any notes"
                    className="metallic-input"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 metallic-button text-white">
                    Submit Payment
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 glass text-white border-white/20 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="metallic-card w-full max-w-md">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Set a new password for your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Enter current password"
                    className="metallic-input"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Enter new password"
                    className="metallic-input"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                    className="metallic-input"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 metallic-button text-white">
                    Change Password
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPasswordForm(false)}
                    className="flex-1 glass text-white border-white/20 hover:bg-white/10"
                  >
                    Cancel
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