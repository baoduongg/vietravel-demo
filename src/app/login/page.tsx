"use client"

import { Suspense, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LockIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { company } from "@/config/company"

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm(): React.JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setLoading(true)
    setError("")

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      setLoading(false)
      setError("Mật khẩu không đúng, Quý khách thử lại nhé.")
      return
    }

    router.replace(searchParams.get("from") || "/")
    router.refresh()
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cloud/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-xl shadow-ocean/5"
      >
        <div className="flex items-center gap-2 text-ocean">
          <SparklesIcon aria-hidden strokeWidth={1.75} className="size-5" />
          <p className="text-sm font-bold">{company.persona.name} · Bản demo nội bộ</p>
        </div>
        <h1 className="mt-3 text-xl font-extrabold text-foreground">Nhập mật khẩu để xem demo</h1>

        <label htmlFor="password" className="mt-6 flex items-center gap-2 rounded-lg border border-input px-2.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <LockIcon aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            autoFocus
            required
            placeholder="Mật khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="border-0 px-0 focus-visible:ring-0"
          />
        </label>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-4 w-full bg-ocean text-white hover:bg-ocean/90">
          {loading ? "Đang kiểm tra..." : "Vào xem demo"}
        </Button>
      </form>
    </main>
  )
}
