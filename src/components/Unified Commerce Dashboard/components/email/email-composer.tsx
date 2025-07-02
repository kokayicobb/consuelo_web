// app/components/email-composer.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Send, Eye, Save, ChevronDown, ChevronUp, Info, Check, AlertCircle, Mail, User, MessageSquare, FileText } from 'lucide-react'

interface EmailFormData {
  from: string
  to: string
  cc?: string
  bcc?: string
  subject: string
  html: string
}

export default function EmailComposer() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  
  const [formData, setFormData] = useState<EmailFormData>({
    from: '',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    html: ''
  })

  // Set the from email when user data loads
  useEffect(() => {
    if (isLoaded && user?.primaryEmailAddress) {
      setFormData(prev => ({
        ...prev,
        from: `${user.firstName || ''} ${user.lastName || ''} <${user.primaryEmailAddress.emailAddress}>`.trim()
      }))
    }
  }, [isLoaded, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (name === 'html') {
      setCharCount(value.length)
    }
  }

  const handleSaveDraft = () => {
    // In production, save to backend
    localStorage.setItem('emailDraft', JSON.stringify(formData))
    toast({
      title: "Draft Saved",
      description: "Your email draft has been saved successfully.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: formData.from,
          to: formData.to,
          cc: formData.cc || undefined,
          bcc: formData.bcc || undefined,
          subject: formData.subject,
          html: `<div style="font-family: Arial, sans-serif; color: #334155; line-height: 1.6;">
            ${formData.html.split('\n').map(line => `<p style="margin: 0 0 10px 0;">${line || '&nbsp;'}</p>`).join('')}
          </div>`
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      toast({
        title: "Email Sent!",
        description: "Your email has been sent successfully.",
      })

      // Reset form
      setFormData(prev => ({
        from: prev.from,
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        html: ''
      }))
      setCharCount(0)
      setShowCcBcc(false)
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Compose Email</h1>
        <p className="text-slate-600">Create and send professional emails with AI-powered assistance</p>
      </div>

      <Card className="shadow-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl">New Email</CardTitle>
          <CardDescription>Fill in the details below to compose your email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From field */}
            <div className="space-y-2">
              <Label htmlFor="from" className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                From
              </Label>
              <div className="relative">
                <Input
                  id="from"
                  name="from"
                  type="email"
                  value={formData.from}
                  className="bg-slate-100 cursor-not-allowed pr-20"
                  disabled
                  readOnly
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                  Auto-filled
                </span>
              </div>
            </div>

            {/* To field */}
            <div className="space-y-2">
              <Label htmlFor="to" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                To
              </Label>
              <Input
                id="to"
                name="to"
                type="email"
                placeholder="recipient@example.com"
                value={formData.to}
                onChange={handleInputChange}
                className="focus:ring-2 focus:ring-sky-500"
                required
              />
              <p className="text-xs text-slate-500">Enter recipient's email address</p>
            </div>

            {/* CC/BCC toggle */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                className="text-sm text-sky-600 hover:text-sky-700 p-0 h-auto font-medium"
                onClick={() => setShowCcBcc(!showCcBcc)}
              >
                {showCcBcc ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Remove CC/BCC
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Add CC/BCC
                  </>
                )}
              </Button>
              
              {showCcBcc && (
                <div className="space-y-4 animate-slide-up">
                  <div className="space-y-2">
                    <Label htmlFor="cc">CC</Label>
                    <Input
                      id="cc"
                      name="cc"
                      type="email"
                      placeholder="cc@example.com"
                      value={formData.cc}
                      onChange={handleInputChange}
                      className="focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bcc">BCC</Label>
                    <Input
                      id="bcc"
                      name="bcc"
                      type="email"
                      placeholder="bcc@example.com"
                      value={formData.bcc}
                      onChange={handleInputChange}
                      className="focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Subject field */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                Subject
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                placeholder="Enter email subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            {/* Email body */}
            <div className="space-y-2">
              <Label htmlFor="html" className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Message
                </span>
                <span className="text-xs text-slate-500">{charCount} characters</span>
              </Label>
              <Textarea
                id="html"
                name="html"
                rows={10}
                placeholder="Type your message here..."
                value={formData.html}
                onChange={handleInputChange}
                className="resize-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            {/* AI Assistant hint */}
            <Alert className="bg-sky-50 border-sky-200">
              <Info className="h-4 w-4 text-sky-600" />
              <AlertDescription className="text-sky-700">
                <span className="font-medium">AI Assistant Coming Soon!</span>
                <br />
                We're working on AI-powered features to help you write better emails faster.
              </AlertDescription>
            </Alert>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSaveDraft}
                className="text-slate-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              
              <div className="flex items-center gap-3">
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Email Preview</DialogTitle>
                      <DialogDescription>
                        This is how your email will appear to recipients
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <p className="text-sm text-slate-500">From</p>
                        <p className="text-slate-900">{formData.from}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">To</p>
                        <p className="text-slate-900">{formData.to || 'Not specified'}</p>
                      </div>
                      {formData.cc && (
                        <div>
                          <p className="text-sm text-slate-500">CC</p>
                          <p className="text-slate-900">{formData.cc}</p>
                        </div>
                      )}
                      {formData.bcc && (
                        <div>
                          <p className="text-sm text-slate-500">BCC</p>
                          <p className="text-slate-900">{formData.bcc}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-slate-500">Subject</p>
                        <p className="text-slate-900 font-medium">{formData.subject || 'No subject'}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500 mb-2">Message</p>
                        <div className="text-slate-900 whitespace-pre-wrap">
                          {formData.html || 'No message content'}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white hover:text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}