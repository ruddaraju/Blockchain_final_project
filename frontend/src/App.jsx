import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './index.css'

// Replace with your deployed contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'YOUR_CONTRACT_ADDRESS_HERE'
const CONTRACT_ABI = [
  "function isMember(address) view returns (bool)",
  "function memberCount() view returns (uint256)",
  "function proposalCount() view returns (uint256)",
  "function createProposal(string) returns (uint256)",
  "function vote(uint256, bool)",
  "function executeProposal(uint256)",
  "function cancelProposal(uint256)",
  "function getProposal(uint256) view returns (address, string, uint256, uint256, uint256, uint256, bool, bool)",
  "function hasVoted(uint256, address) view returns (bool)",
  "function getVoteWeight(address) view returns (uint256)",
  "function getActiveMemberCount() view returns (uint256)",
  "event ProposalCreated(uint256 indexed, address indexed, string, uint256, uint256)",
  "event VoteCast(uint256 indexed, address indexed, bool, uint256)",
  "event ProposalExecuted(uint256 indexed)",
  "event ProposalCanceled(uint256 indexed)"
]

function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [newProposal, setNewProposal] = useState('')

  useEffect(() => {
    if (contract && account) {
      checkMembership()
      loadProposals()
    }
  }, [contract, account])

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        
        setProvider(provider)
        setSigner(signer)
        setAccount(address)
        
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        setContract(contractInstance)
        
        setError(null)
        setSuccess('Wallet connected successfully!')
      } else {
        setError('Please install MetaMask or another Web3 wallet')
      }
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message)
    }
  }

  const checkMembership = async () => {
    try {
      const member = await contract.isMember(account)
      setIsMember(member)
    } catch (err) {
      console.error('Error checking membership:', err)
    }
  }

  const loadProposals = async () => {
    try {
      setLoading(true)
      const count = await contract.proposalCount()
      const proposalArray = []
      
      for (let i = 0; i < count; i++) {
        try {
          const proposal = await contract.getProposal(i)
          const hasVoted = await contract.hasVoted(i, account)
          
          proposalArray.push({
            id: i,
            proposer: proposal[0],
            description: proposal[1],
            voteStart: Number(proposal[2]),
            voteEnd: Number(proposal[3]),
            forVotes: Number(proposal[4]),
            againstVotes: Number(proposal[5]),
            executed: proposal[6],
            canceled: proposal[7],
            hasVoted: hasVoted
          })
        } catch (err) {
          console.error(`Error loading proposal ${i}:`, err)
        }
      }
      
      setProposals(proposalArray.reverse()) // Show newest first
      setLoading(false)
    } catch (err) {
      setError('Failed to load proposals: ' + err.message)
      setLoading(false)
    }
  }

  const createProposal = async () => {
    if (!newProposal.trim()) {
      setError('Please enter a proposal description')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      const tx = await contract.createProposal(newProposal)
      await tx.wait()
      setSuccess('Proposal created successfully!')
      setNewProposal('')
      await loadProposals()
      setLoading(false)
    } catch (err) {
      setError('Failed to create proposal: ' + err.message)
      setLoading(false)
    }
  }

  const vote = async (proposalId, support) => {
    try {
      setLoading(true)
      setError(null)
      const tx = await contract.vote(proposalId, support)
      await tx.wait()
      setSuccess(`Vote cast ${support ? 'in favor' : 'against'} proposal!`)
      await loadProposals()
      setLoading(false)
    } catch (err) {
      setError('Failed to vote: ' + err.message)
      setLoading(false)
    }
  }

  const executeProposal = async (proposalId) => {
    try {
      setLoading(true)
      setError(null)
      const tx = await contract.executeProposal(proposalId)
      await tx.wait()
      setSuccess('Proposal executed successfully!')
      await loadProposals()
      setLoading(false)
    } catch (err) {
      setError('Failed to execute proposal: ' + err.message)
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const isVotingActive = (voteStart, voteEnd) => {
    const now = Math.floor(Date.now() / 1000)
    return now >= voteStart && now <= voteEnd
  }

  return (
    <div className="container">
      <h1>🗳️ DAO Voting Platform</h1>
      
      {!account ? (
        <div className="card">
          <h2>Connect Your Wallet</h2>
          <p>Connect your MetaMask wallet to interact with the DAO voting contract.</p>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>
      ) : (
        <>
          <div className="card">
            <div className={`status ${isMember ? 'connected' : 'disconnected'}`}>
              {isMember ? '✓ You are a member' : '✗ You are not a member'}
            </div>
            <p><strong>Account:</strong> {account}</p>
            <button onClick={loadProposals}>Refresh Proposals</button>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {isMember && (
            <div className="card">
              <h2>Create New Proposal</h2>
              <textarea
                placeholder="Enter proposal description..."
                value={newProposal}
                onChange={(e) => setNewProposal(e.target.value)}
              />
              <button onClick={createProposal} disabled={loading}>
                {loading ? 'Creating...' : 'Create Proposal'}
              </button>
            </div>
          )}

          <div className="card">
            <h2>Proposals ({proposals.length})</h2>
            {loading && <div className="loading">Loading proposals...</div>}
            {!loading && proposals.length === 0 && (
              <p>No proposals yet. Create one to get started!</p>
            )}
            {proposals.map((proposal) => (
              <div key={proposal.id} className="proposal">
                <h3>Proposal #{proposal.id}</h3>
                <p>{proposal.description}</p>
                <div className="proposal-info">
                  <span><strong>Proposer:</strong> {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                  <span><strong>Votes For:</strong> {proposal.forVotes}</span>
                  <span><strong>Votes Against:</strong> {proposal.againstVotes}</span>
                  <span><strong>Status:</strong> {
                    proposal.canceled ? 'Canceled' :
                    proposal.executed ? 'Executed' :
                    isVotingActive(proposal.voteStart, proposal.voteEnd) ? 'Voting Active' :
                    'Voting Ended'
                  }</span>
                  <span><strong>Ends:</strong> {formatDate(proposal.voteEnd)}</span>
                </div>
                {isMember && !proposal.hasVoted && isVotingActive(proposal.voteStart, proposal.voteEnd) && !proposal.executed && !proposal.canceled && (
                  <div className="vote-buttons">
                    <button className="yes" onClick={() => vote(proposal.id, true)}>
                      Vote Yes
                    </button>
                    <button className="no" onClick={() => vote(proposal.id, false)}>
                      Vote No
                    </button>
                  </div>
                )}
                {proposal.hasVoted && (
                  <p style={{ color: '#28a745', fontWeight: 'bold' }}>✓ You have voted on this proposal</p>
                )}
                {isMember && !proposal.executed && !proposal.canceled && !isVotingActive(proposal.voteStart, proposal.voteEnd) && (
                  <button onClick={() => executeProposal(proposal.id)} disabled={loading}>
                    Execute Proposal
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default App

