import type { CSSProperties } from 'react'

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  marginBottom: 6,
  color: '#242423',
}

export const inputStyle: CSSProperties = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid #d1d5dc',
  borderRadius: 4,
  padding: '12px 16px',
  fontSize: 14,
  color: '#000',
  outline: 'none',
  boxSizing: 'border-box',
}

export const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 120,
  resize: 'vertical',
  fontFamily: 'inherit',
}

export const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #d1d5dc',
  borderRadius: 16,
  padding: '32px',
}

export const primaryButtonStyle: CSSProperties = {
  background: '#000',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '12px 24px',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  letterSpacing: '-0.01em',
}

export const ghostButtonStyle: CSSProperties = {
  background: 'transparent',
  color: '#000',
  border: '1px solid #d1d5dc',
  borderRadius: 4,
  padding: '12px 24px',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
}

export const errorBoxStyle: CSSProperties = {
  background: '#fff0ee',
  border: '1px solid #dc341e',
  borderRadius: 4,
  padding: '10px 14px',
  fontSize: 14,
  color: '#dc341e',
}

export const pillStyle: CSSProperties = {
  display: 'inline-block',
  background: '#f4f4f0',
  color: '#242423',
  borderRadius: 4,
  padding: '6px 12px',
  fontSize: 14,
}
