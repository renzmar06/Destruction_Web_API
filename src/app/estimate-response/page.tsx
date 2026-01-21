'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function EstimateResponseContent() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [customerResponse, setCustomerResponse] = useState('');
  const searchParams = useSearchParams();
  
  const estimateId = searchParams.get('id');
  const action = searchParams.get('action');

  useEffect(() => {
    if (!estimateId || !action) {
      setStatus('error');
      setMessage('Invalid request parameters');
      return;
    }
    setStatus('ready');
  }, [estimateId, action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');

    try {
      const response = await fetch('/api/estimates/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimateId,
          action,
          customerResponse
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
      } else {
        setStatus('error');
        setMessage(result.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to process your response');
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    textAlign: 'center' as const
  };

  if (status === 'success') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '60px', color: '#28a745', marginBottom: '20px' }}>✓</div>
          <h1 style={{ color: '#28a745', marginBottom: '20px', fontSize: '28px' }}>Response Submitted!</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>{message}</p>
          <p style={{ fontSize: '16px', color: '#888' }}>Thank you for your response. We will contact you soon.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '60px', color: '#dc3545', marginBottom: '20px' }}>✗</div>
          <h1 style={{ color: '#dc3545', marginBottom: '20px', fontSize: '28px' }}>Error</h1>
          <p style={{ fontSize: '18px', color: '#666' }}>{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>⏳</div>
          <h1 style={{ color: '#333', marginBottom: '20px', fontSize: '28px' }}>Processing...</h1>
          <p style={{ fontSize: '16px', color: '#666' }}>Please wait while we process your response.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '50px', marginBottom: '20px' }}>
          {action === 'accept' ? '✅' : '❌'}
        </div>
        <h1 style={{ color: '#333', marginBottom: '10px', fontSize: '28px' }}>Estimate Response</h1>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
          You are about to <strong style={{ color: action === 'accept' ? '#28a745' : '#dc3545' }}>{action}</strong> this estimate.
        </p>
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="response" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Additional Comments (Optional):
            </label>
            <textarea
              id="response"
              value={customerResponse}
              onChange={(e) => setCustomerResponse(e.target.value)}
              rows={4}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #e1e5e9', 
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical' as const,
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              placeholder="Any additional comments or questions..."
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px 24px',
              backgroundColor: action === 'accept' ? '#28a745' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            {action === 'accept' ? '✓ Accept Estimate' : '✗ Reject Estimate'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EstimateResponse() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
      </div>
    }>
      <EstimateResponseContent />
    </Suspense>
  );
}