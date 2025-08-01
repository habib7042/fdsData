'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Member {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
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
  member: {
    name: string
    email: string
  }
}

export default function AccountantDashboard() {
  const [members, setMembers] = useState<Member[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    monthlyAmount: '',
    password: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('fds-token')
    const role = localStorage.getItem('fds-role')
    
    if (!token || role !== 'ACCOUNTANT') {
      window.location.href = '/'
      return
    }

    fetchMembers()
    fetchPayments()
  }, [])

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('fds-token')
      const response = await fetch('/api/accountant/members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('fds-token')
      const response = await fetch('/api/accountant/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('fds-token')
      const response = await fetch('/api/accountant/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMember)
      })

      if (response.ok) {
        const data = await response.json()
        setShowAddMemberForm(false)
        setNewMember({ name: '', email: '', phone: '', address: '', monthlyAmount: '', password: '' })
        fetchMembers()
        
        // Show success message with password if auto-generated
        let message = 'Member added successfully!'
        if (data.tempPassword) {
          message += `\n\nTemporary Password: ${data.tempPassword}\nPlease share this with the member.`
        }
        alert(message)
      } else {
        alert('Failed to add member.')
      }
    } catch (error) {
      alert('An error occurred while adding member.')
    }
  }

  const handlePaymentAction = async (paymentId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const token = localStorage.getItem('fds-token')
      const response = await fetch(`/api/accountant/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        fetchPayments()
        fetchMembers()
        alert(`Payment ${action.toLowerCase()}d successfully!`)
      } else {
        alert(`Failed to ${action.toLowerCase()} payment.`)
      }
    } catch (error) {
      alert(`An error occurred while ${action.toLowerCase()}ing payment.`)
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      const token = localStorage.getItem('fds-token')
      const response = await fetch(`/api/accountant/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchMembers()
        alert('Member deleted successfully!')
      } else {
        alert('Failed to delete member.')
      }
    } catch (error) {
      alert('An error occurred while deleting member.')
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

  const pendingPayments = payments.filter(p => p.status === 'PENDING')
  const totalFund = members.reduce((sum, member) => sum + member.totalPaid, 0)
  const totalDue = members.reduce((sum, member) => sum + member.totalDue, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FDS</h1>
              <span className="ml-4 text-gray-600">হিসাবরক্ষক ড্যাশবোর্ড</span>
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
            স্বাগতম, হিসাবরক্ষক!
          </h2>
          <p className="text-gray-600">সদস্যদের ব্যবস্থাপনা এবং পেমেন্ট যাচাই করুন</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট সদস্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট ফান্ড</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">৳{totalFund}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট বকেয়া</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">৳{totalDue}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অপেক্ষমান পেমেন্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="members">সদস্য ব্যবস্থাপনা</TabsTrigger>
              <TabsTrigger value="payments">পেমেন্ট যাচাই</TabsTrigger>
            </TabsList>
            
            <Dialog open={showAddMemberForm} onOpenChange={setShowAddMemberForm}>
              <DialogTrigger asChild>
                <Button>নতুন সদস্য যোগ করুন</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন সদস্য যোগ করুন</DialogTitle>
                  <DialogDescription>নতুন সদস্যের তথ্য পূরণ করুন</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <Label htmlFor="name">নাম</Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">ইমেল</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">ফোন</Label>
                    <Input
                      id="phone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">ঠিকানা</Label>
                    <Input
                      id="address"
                      value={newMember.address}
                      onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="monthlyAmount">মাসিক চাঁদা</Label>
                    <Input
                      id="monthlyAmount"
                      type="number"
                      value={newMember.monthlyAmount}
                      onChange={(e) => setNewMember({...newMember, monthlyAmount: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">পাসওয়ার্ড</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newMember.password}
                      onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                      placeholder="খালি থাকলে স্বয়ংক্রিয়ভাবে তৈরি হবে"
                    />
                    <p className="text-xs text-gray-500 mt-1">খালি থাকলে স্বয়ংক্রিয়ভাবে পাসওয়ার্ড তৈরি হবে</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      যোগ করুন
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddMemberForm(false)}
                      className="flex-1"
                    >
                      বাতিল
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>সদস্য তালিকা</CardTitle>
                <CardDescription>সকল সদস্যের তথ্য এবং হিসাব</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">কোন সদস্য পাওয়া যায়নি</p>
                  ) : (
                    members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                            <p className="text-sm text-gray-500">{member.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">মাসিক: ৳{member.monthlyAmount}</p>
                            <p className="text-sm text-green-600">জমা: ৳{member.totalPaid}</p>
                            <p className="text-sm text-red-600">বকেয়া: ৳{member.totalDue}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={member.isActive ? "default" : "secondary"}>
                            {member.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </Badge>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            ডিলিট
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>পেমেন্ট যাচাই</CardTitle>
                <CardDescription>অপেক্ষমান পেমেন্টগুলো যাচাই করুন</CardDescription>
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
                            <p className="text-sm text-gray-500">{payment.member.name}</p>
                            <p className="text-sm text-gray-500">{payment.paymentMethod}</p>
                            {payment.transactionId && (
                              <p className="text-sm text-gray-500">TXN: {payment.transactionId}</p>
                            )}
                            {payment.notes && (
                              <p className="text-sm text-gray-500">নোট: {payment.notes}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              জমা: {new Date(payment.submittedAt).toLocaleDateString('bn-BD')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(payment.status)}
                          
                          {payment.status === 'PENDING' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => handlePaymentAction(payment.id, 'APPROVE')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                অনুমোদন
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handlePaymentAction(payment.id, 'REJECT')}
                              >
                                প্রত্যাখ্যান
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}