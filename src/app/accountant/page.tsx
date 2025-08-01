'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, 
  DollarSign, 
  TrendingDown, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  LogOut,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Shield,
  Settings
} from 'lucide-react'

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

  const pendingPayments = payments.filter(p => p.status === 'PENDING')
  const totalFund = members.reduce((sum, member) => sum + (member.totalPaid || 0), 0)
  const totalDue = members.reduce((sum, member) => sum + (member.totalDue || 0), 0)

  return (
    <div className="min-h-screen metallic-bg">
      {/* Header */}
      <header className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg metallic-card flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <h1 className="text-xl font-bold text-white">FDS</h1>
              </div>
              <span className="text-indigo-200">Accountant Dashboard</span>
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
            Welcome, Accountant!
          </h2>
          <p className="text-indigo-200">Manage members and verify payments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="metallic-card animate-fade-in" style={{animationDelay: '0.1s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
              <Users className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{members.length}</div>
            </CardContent>
          </Card>
          
          <Card className="metallic-card animate-fade-in" style={{animationDelay: '0.2s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Fund</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">৳{totalFund.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="metallic-card animate-fade-in" style={{animationDelay: '0.3s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Due</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">৳{totalDue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="metallic-card animate-fade-in" style={{animationDelay: '0.4s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="members" className="space-y-4">
          <div className="flex items-center justify-between animate-fade-in" style={{animationDelay: '0.5s'}}>
            <TabsList className="glass">
              <TabsTrigger value="members" className="text-white hover:bg-white/10">Member Management</TabsTrigger>
              <TabsTrigger value="payments" className="text-white hover:bg-white/10">Payment Verification</TabsTrigger>
            </TabsList>
            
            <Dialog open={showAddMemberForm} onOpenChange={setShowAddMemberForm}>
              <DialogTrigger asChild>
                <Button className="metallic-button text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Member
                </Button>
              </DialogTrigger>
              <DialogContent className="metallic-card">
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                  <DialogDescription>Enter the new member's information</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      className="metallic-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      className="metallic-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      className="metallic-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newMember.address}
                      onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                      className="metallic-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="monthlyAmount">Monthly Contribution</Label>
                    <Input
                      id="monthlyAmount"
                      type="number"
                      value={newMember.monthlyAmount}
                      onChange={(e) => setNewMember({...newMember, monthlyAmount: e.target.value})}
                      className="metallic-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newMember.password}
                      onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                      className="metallic-input"
                      placeholder="Leave empty to auto-generate"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate a temporary password</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1 metallic-button text-white">
                      Add Member
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddMemberForm(false)}
                      className="flex-1 glass text-white border-white/20 hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="members" className="space-y-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Card className="metallic-card">
              <CardHeader>
                <CardTitle>Member List</CardTitle>
                <CardDescription>All registered members and their account status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {members.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No members found</p>
                  ) : (
                    members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span>{member.email}</span>
                            </div>
                            {member.phone && (
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Monthly: ৳{member.monthlyAmount?.toLocaleString()}</p>
                          <p className="text-sm text-green-600">Paid: ৳{member.totalPaid?.toLocaleString()}</p>
                          <p className="text-sm text-red-600">Due: ৳{member.totalDue?.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={member.isActive ? "default" : "secondary"} className="metallic-badge">
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                            className="hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4 animate-fade-in" style={{animationDelay: '0.7s'}}>
            <Card className="metallic-card">
              <CardHeader>
                <CardTitle>Payment Verification</CardTitle>
                <CardDescription>Review and verify pending payments</CardDescription>
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
                            <p className="text-sm text-gray-500">{payment.member.name}</p>
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
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                            <Calendar className="w-3 h-3" />
                            <span>Submitted: {new Date(payment.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(payment.status)}
                            {payment.status === 'PENDING' && (
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handlePaymentAction(payment.id, 'APPROVE')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handlePaymentAction(payment.id, 'REJECT')}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
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