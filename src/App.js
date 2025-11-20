import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [nodes, setNodes] = useState([]);
  const [leader, setLeader] = useState(null);
  const [votes, setVotes] = useState({});
  const [nodeName, setNodeName] = useState("");
  const [nodeValue, setNodeValue] = useState("");
  const [voterName, setVoterName] = useState("");
  const [voteFor, setVoteFor] = useState("");
  const [error, setError] = useState("");

  const BACKEND = "http://localhost:5000";

  const fetchNodes = async () => {
    try {
      const res = await axios.get(`${BACKEND}/nodes`);
      setNodes(res.data);
    } catch {
      setError("Failed to fetch nodes");
    }
  };

  const fetchLeader = async () => {
    try {
      const res = await axios.get(`${BACKEND}/leader`);
      setLeader(res.data.leader);
    } catch {
      setError("Failed to fetch leader");
    }
  };

  const fetchVotes = async () => {
    try {
      const res = await axios.get(`${BACKEND}/votes`);
      setVotes(res.data.tally);
    } catch {
      setError("Failed to fetch votes");
    }
  };

  const createNode = async () => {
    if (!nodeName || !nodeValue) return;
    try {
      await axios.post(`${BACKEND}/nodes`, { name: nodeName, value: nodeValue });
      setNodeName("");
      setNodeValue("");
      fetchNodes();
    } catch {
      setError("Failed to create node");
    }
  };

  const castVote = async () => {
    if (!voterName || !voteFor) return;
    try {
      await axios.post(`${BACKEND}/vote`, { voter: voterName, voteFor });
      setVoterName("");
      setVoteFor("");
      fetchVotes();
      fetchLeader();
    } catch {
      setError("Failed to cast vote");
    }
  };

  const runSimulation = async () => {
    try {
      await axios.post(`${BACKEND}/simulate`);
      fetchVotes();
      fetchLeader();
      fetchNodes();
    } catch (err) {
      alert("Simulation failed: " + err.message);
    }
  };

  useEffect(() => {
    fetchNodes();
    fetchVotes();
    fetchLeader();
    const interval = setInterval(() => {
      fetchNodes();
      fetchVotes();
      fetchLeader();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxVotes = Math.max(...Object.values(votes), 1);

  return (
    <div className="container">
      <h1>ZooKeeper Node Manager & Leader Election</h1>
      {error && <p className="error">{error}</p>}

      {/* Node Management */}
      <div className="card">
        <h2>Create Node</h2>
        <div className="input-group">
          <input
            placeholder="Node Name"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
          />
          <input
            placeholder="Node Value"
            value={nodeValue}
            onChange={(e) => setNodeValue(e.target.value)}
          />
          <button onClick={createNode}>Add Node</button>
        </div>
        <ul className="node-list">
          {nodes.map((n) => (
            <li key={n.name} className={leader === n.name ? "leader-node" : ""}>
              <span>{n.name}</span>
              <span>{n.value}</span>
              {leader === n.name && <span className="leader-badge">Leader</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Voting */}
      <div className="card">
        <h2>Voting</h2>
        <div className="input-group">
          <input
            placeholder="Your Name"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
          />
          <input
            placeholder="Vote For"
            value={voteFor}
            onChange={(e) => setVoteFor(e.target.value)}
          />
          <button onClick={castVote}>Cast Vote</button>
        </div>

        <ul className="vote-list">
          {Object.entries(votes).map(([candidate, count]) => (
            <li key={candidate} className={leader === candidate ? "leader-node" : ""}>
              <div className="vote-info">
                <span>{candidate}</span>
                <span>{count} votes</span>
              </div>
              <div
                className="vote-bar"
                style={{ width: `${(count / maxVotes) * 100}%` }}
              ></div>
            </li>
          ))}
        </ul>

        <button className="simulation-btn" onClick={runSimulation}>
          Run Simulation
        </button>
      </div>

      {/* Current Leader */}
      <div className="card leader-display">
        <h2>Current Leader</h2>
        <p>{leader || "No leader yet"}</p>
      </div>
    </div>
  );
}

export default App;
