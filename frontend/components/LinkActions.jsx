'use client'

import { useEffect, useRef, useState } from 'react'
import { FaCopy, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa'

const LinkActions = ({ isOpen, position, href, onCopy, onEdit, onRemove, onClose }) => {
	const containerRef = useRef(null)
	const [copied, setCopied] = useState(false)

	useEffect(() => {
		if (!isOpen) return
		const onKey = (e) => {
			if (e.key === 'Escape') onClose && onClose()
		}
		const onDown = (e) => {
			const el = containerRef.current
			if (el && !el.contains(e.target)) onClose && onClose()
		}
		document.addEventListener('keydown', onKey, true)
		document.addEventListener('mousedown', onDown, true)
		return () => {
			document.removeEventListener('keydown', onKey, true)
			document.removeEventListener('mousedown', onDown, true)
		}
	}, [isOpen, onClose])

	useEffect(() => {
		if (copied) {
			const timer = setTimeout(() => setCopied(false), 2000)
			return () => clearTimeout(timer)
		}
	}, [copied])

	if (!isOpen) return null

	// Derive a compact website label (e.g., amazon.in) from href
	let displayLabel = href || ''
	let fullUrl = href || ''
	let faviconDomain = ''
	try {
		const normalized = /^https?:\/\//i.test(href) ? href : `https://${href}`
		const u = new URL(normalized)
		const host = (u.hostname || '').toLowerCase()
		displayLabel = host.replace(/^www\./, '')
		faviconDomain = displayLabel
		fullUrl = normalized
	} catch {
		fullUrl = href
	}

	const faviconUrl = faviconDomain
		? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(faviconDomain)}&sz=16`
		: ''

	const handleCopy = () => {
		if (href) {
			navigator.clipboard.writeText(href)
			setCopied(true)
			onCopy && onCopy()
		}
	}

	const handleOpenLink = (e) => {
		if (href) {
			window.open(fullUrl, '_blank', 'noopener,noreferrer')
			onClose && onClose()
		}
	}

	// Position directly under the link
	const top = position?.y || 0
	const left = position?.x || 0

	return (
		<div 
			ref={containerRef} 
			className="fixed z-50 shadow-lg rounded-lg bg-white border border-gray-200 overflow-hidden"
			style={{ 
				top: `${top}px`, 
				left: `${left}px`,
				minWidth: '280px',
				maxWidth: '400px'
			}}
		>
			{/* Link Preview Section - Clickable */}
			<div 
				onClick={handleOpenLink}
				className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
			>
				{href ? (
					<div className="flex items-center gap-3">
						{faviconUrl && (
							<img 
								src={faviconUrl} 
								alt="" 
								className="w-5 h-5 flex-shrink-0" 
								loading="lazy"
								onError={(e) => {
									e.target.style.display = 'none'
								}}
							/>
						)}
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-blue-600 truncate">
								{displayLabel || href}
							</div>
							<div className="text-xs text-gray-500 truncate mt-0.5">
								{href.length > 40 ? `${href.substring(0, 40)}...` : href}
							</div>
						</div>
						<FaExternalLinkAlt className="w-4 h-4 text-gray-400 flex-shrink-0" />
					</div>
				) : (
					<div className="text-sm text-gray-600">No link</div>
				)}
			</div>

			{/* Action Buttons - Icons Only (like Google Docs) */}
			<div className="px-2 py-2 flex items-center justify-center gap-1">
				<button
					onClick={handleCopy}
					className={`p-2 rounded hover:bg-gray-100 transition-colors ${copied ? 'bg-green-50 text-green-600' : 'text-gray-700'}`}
					title={copied ? 'Copied!' : 'Copy link'}
					aria-label="Copy link"
				>
					<FaCopy className="w-4 h-4" />
				</button>
				<button
					onClick={onEdit}
					className="p-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
					title="Edit link"
					aria-label="Edit link"
				>
					<FaEdit className="w-4 h-4" />
				</button>
				<button
					onClick={onRemove}
					className="p-2 rounded hover:bg-gray-100 text-red-600 transition-colors"
					title="Remove link"
					aria-label="Remove link"
				>
					<FaTrash className="w-4 h-4" />
				</button>
			</div>
		</div>
	)
}

export default LinkActions


