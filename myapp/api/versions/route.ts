import { NextResponse } from 'next/server'
export async function GET() {
    try {
      const response = await fetch('http://localhost:8080/statistics/gameVersions')
      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch game versions' }, { status: 500 })
    }
  }