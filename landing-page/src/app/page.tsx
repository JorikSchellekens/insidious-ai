'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Globe, Settings, List, Zap, ChevronDown, Share2 } from 'lucide-react'
import BackgroundCanvas from '@/components/BackgroundCanvas'

const features = [
  { icon: Brain, title: "AI Transformers", description: "Apply AI-driven transformations to web content with ease." },
  { icon: Globe, title: "Explorer Page", description: "Interactively explore different AI transformations in real-time." },
  { icon: List, title: "Transformer Management", description: "Add, modify, and organize transformers using the intuitive Transformer List component." },
  { icon: Settings, title: "Customizable Settings", description: "Tailor the extension to your preferences via the comprehensive settings page." },
  { icon: Zap, title: "Seamless Integration", description: "Easily integrate Insidious.ai into your daily browsing without any disruptions." },
  { icon: Share2, title: "Publish Transformers", description: "Create and share your own transformers with the Insidious.ai community." } // New feature
]

const originalText = "The Internet has revolutionized the way we communicate and access information. It has connected people across the globe and made knowledge more accessible than ever before."

const exampleTransformations = [
  { 
    transformer: "Original Text",
    transformed: originalText
  },
  { 
    transformer: "Emoji Emphasis",
    transformed: "The Internet 🌐 has revolutionized 🚀 the way we communicate 💬 and access information 📚. It has connected people across the globe 🌍 and made knowledge more accessible 🧠 than ever before ⏳."
  },
  {
    transformer: "Future Time Traveler",
    transformed: "Looking back from 2123, it's fascinating to see how the early Internet revolutionized communication and information access. While our current neural-link networks are far more advanced, that global digital web laid the crucial groundwork for today's instantaneous knowledge transfer."
  },
  {
    transformer: "Poetic Prose",
    transformed: "In the grand tapestry of human progress, the Internet stands as a shimmering thread, weaving connections across the vast expanse of our world. It has become the river of knowledge, its digital currents carrying whispers of information to the farthest shores of human curiosity."
  },
  {
    transformer: "Explain Like I'm 5",
    transformed: "Imagine a big, magical book that everyone in the world can read and write in at the same time. The Internet is like that! It helps people talk to friends far away and learn about anything they want, super fast. It's made it easier for everyone to know more things, like having a huge library in your pocket!"
  },
  {
    transformer: "Conspiracy Theorist",
    transformed: "Sure, they tell us the Internet 'revolutionized' communication and made information 'accessible.' But have you ever wondered who's really controlling this global network? Why are they so keen on connecting everyone? What if it's all a massive surveillance system, tracking our every move and thought? Wake up, sheeple!"
  }
]

interface AnimationState {
  phase: 'idle' | 'highlight' | 'write-name' | 'unhighlight' | 'write-text' | 'wait';
  progress: number;
  currentIndex: number;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [displayedText, setDisplayedText] = useState(originalText)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [animationState, setAnimationState] = useState<AnimationState>({
    phase: 'idle',
    progress: 0,
    currentIndex: 0
  });
  const [originalTransformerName, setOriginalTransformerName] = useState('Original Text')
  const [selectedTransformer, setSelectedTransformer] = useState(exampleTransformations[0]);

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const gridSize = 50
    const dots: { x: number; y: number; targetX: number; targetY: number; life: number }[] = []

    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Animate dots
      if (Math.random() < 0.1) {
        const x = Math.floor(Math.random() * (width / gridSize)) * gridSize
        const y = Math.floor(Math.random() * (height / gridSize)) * gridSize
        dots.push({ x, y, targetX: x, targetY: y, life: 200 })
      }

      ctx.fillStyle = 'rgba(0, 255, 128, 0.8)' // More green color
      for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i]
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2)
        ctx.fill()

        // Move dot towards target
        const dx = dot.targetX - dot.x
        const dy = dot.targetY - dot.y
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          dot.x += dx * 0.1
          dot.y += dy * 0.1
        } else {
          // Set new target when reached
          const directions = [
            { dx: gridSize, dy: 0 },
            { dx: -gridSize, dy: 0 },
            { dx: 0, dy: gridSize },
            { dx: 0, dy: -gridSize },
          ]
          const { dx, dy } = directions[Math.floor(Math.random() * directions.length)]
          dot.targetX = Math.max(0, Math.min(width, dot.x + dx))
          dot.targetY = Math.max(0, Math.min(height, dot.y + dy))
        }

        dot.life--
        if (dot.life <= 0) {
          dots.splice(i, 1)
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  useEffect(() => {
    let rafId: number;
    let lastTimestamp: number;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      setAnimationState(prevState => {
        const { phase, progress, currentIndex } = prevState;
        const newTransformer = exampleTransformations[currentIndex];

        switch (phase) {
          case 'idle':
            return { phase: 'highlight', progress: 0, currentIndex };
          case 'highlight':
            if (progress < 500) return { ...prevState, progress: progress + deltaTime };
            return { phase: 'write-name', progress: 0, currentIndex };
          case 'write-name':
            if (progress === 0) {
              setSelectedTransformer(newTransformer);
            }
            if (progress < newTransformer.transformer.length * 50) {
              return { ...prevState, progress: progress + deltaTime };
            }
            return { phase: 'unhighlight', progress: 0, currentIndex };
          case 'unhighlight':
            if (progress < 500) return { ...prevState, progress: progress + deltaTime };
            return { phase: 'write-text', progress: 0, currentIndex };
          case 'write-text':
            const newText = newTransformer.transformed;
            if (progress < newText.length * 20) {
              setDisplayedText(newText.slice(0, Math.floor(progress / 20)));
              return { ...prevState, progress: progress + deltaTime };
            }
            return { phase: 'wait', progress: 0, currentIndex };
          case 'wait':
            if (progress < 5500) return { ...prevState, progress: progress + deltaTime };
            const nextIndex = (currentIndex + 1) % exampleTransformations.length;
            return { phase: 'highlight', progress: 0, currentIndex: nextIndex };
        }
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    setIsHighlighted(animationState.phase === 'highlight' || animationState.phase === 'write-name');
  }, [animationState.phase]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    setDisplayedText(originalText)
    setOriginalTransformerName('Original Text')
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setDisplayedText(exampleTransformations[animationState.currentIndex].transformed)
    setOriginalTransformerName(exampleTransformations[animationState.currentIndex].transformer)
  }, [animationState.currentIndex])

  const handleDropdownToggle = useCallback(() => {
    setIsDropdownOpen(prev => !prev)
  }, [])

  const handleTransformerSelect = useCallback((transformation: typeof exampleTransformations[0]) => {
    setSelectedTransformer(transformation);
    setDisplayedText(transformation.transformed);
    setOriginalTransformerName(transformation.transformer);
    setIsDropdownOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setOriginalTransformerName(selectedTransformer.transformer)
  }, [selectedTransformer])

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <BackgroundCanvas />
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-5xl font-bold mb-6 text-emerald-300">Insidious.ai</h1>
        <p className="text-xl mb-8 max-w-2xl text-center">
          AI can transform your real time browsing experience. Transform everything you read and see.
        </p>
        <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-bold py-3 px-6 rounded-full text-lg transition-colors duration-300">
          <Link href="https://chromewebstore.google.com/detail/insidious/ggagkncjchhmgfoohllfgoohjalmngcf">
            Get Insidious Now
          </Link>
        </Button>

        {/* Features section */}
        <div className="mt-16 w-full">
          <h2 className="text-3xl font-semibold mb-8 text-center text-emerald-300">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <feature.icon className="w-12 h-12 mb-4 text-emerald-400" />
                  <h3 className="text-xl font-semibold mb-2 text-emerald-300">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Example transformations section */}
        <div className="mt-16 w-full">
          <h2 className="text-3xl font-semibold mb-8 text-center text-emerald-300">See It In Action</h2>
          <div className="relative" ref={dropdownRef}>
            <div 
              className={`absolute -top-8 left-4 text-lg font-semibold ${isHighlighted ? 'text-emerald-300' : 'text-gray-300'} cursor-pointer flex items-center`}
              onClick={handleDropdownToggle}
            >
              <span className="truncate max-w-[200px]">{isHovering ? 'Original Text' : selectedTransformer.transformer}</span>
              <ChevronDown className={`ml-2 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
            </div>
            {isDropdownOpen && (
              <div className="absolute top-0 left-4 mt-6 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20">
                {exampleTransformations.map((transformation, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer truncate"
                    onClick={() => handleTransformerSelect(transformation)}
                  >
                    {transformation.transformer}
                  </div>
                ))}
              </div>
            )}
            <Card 
              className={`bg-gray-800 border-2 transition-all duration-300 ${isHighlighted || isHovering ? 'border-emerald-300' : 'border-gray-700'}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <CardContent className="p-6">
                <p className="text-xl text-white min-h-[8rem] flex items-center">
                  {displayedText}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to action section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-semibold mb-4 text-emerald-300">Ready to Transform Your Browsing?</h2>
          <p className="text-xl mb-8">Join the AI revolution in web browsing today!</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-bold py-3 px-6 rounded-full text-lg transition-colors duration-300">
              <Link href="https://chromewebstore.google.com/detail/insidious/ggagkncjchhmgfoohllfgoohjalmngcf">
                Install Insidious.ai
              </Link>
            </Button>
            <Button asChild className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors duration-300">
              <Link href="/subscription">
                See plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
