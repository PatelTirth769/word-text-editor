'use client'

import { useEffect, useRef, useState } from 'react'

const LinkEditor = ({ isOpen, position, initialText = '', initialUrl = '', onApply, onClose }) => {
	const [text, setText] = useState(initialText || '')
	const [url, setUrl] = useState(initialUrl || '')
	const containerRef = useRef(null)

	useEffect(() => {
		if (!isOpen) return
		setText(initialText || '')
		setUrl(initialUrl || '')
	}, [isOpen, initialText, initialUrl])

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

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
			if (e.target === e.currentTarget) {
				onClose && onClose()
			}
		}}>
			<div ref={containerRef} className="bg-white border border-gray-300 rounded shadow-lg p-4 w-80">
				<div className="text-sm font-semibold text-gray-700 mb-3">Create Link</div>
				<div className="space-y-3">
					<div>
						<label className="block text-xs text-gray-600 mb-1">Text</label>
						<input
							type="text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Link text"
						/>
					</div>
					<div>
						<label className="block text-xs text-gray-600 mb-1">URL</label>
						<input
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="https://example.com"
						/>
					</div>
					<div className="flex justify-end gap-2 pt-2">
						<button
							onClick={() => onClose && onClose()}
							className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							onClick={() => onApply && onApply({ text: text?.trim(), url: url?.trim() })}
							className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
							disabled={!url?.trim()}
						>
							Apply
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LinkEditor









