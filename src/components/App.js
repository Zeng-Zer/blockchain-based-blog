import React, { Component } from 'react';
// Dependencies
import Web3 from 'web3';
// Components
import Navbar from './Navbar';
import Main from './Main';
// Smart contracts
import SocialNetwork from '../abis/SocialNetwork.json';
// HTML / CSS
import logo from '../logo.png';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: true,
    };

    this.createPost = this.createPost.bind(this);
    this.tipPost = this.tipPost.bind(this);
  }
  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            posts={this.state.posts}
            createPost={this.createPost}
            tipPost={this.tipPost}
          />
        }
      </div>
    );
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    const networkData = SocialNetwork.networks[networkId];
    if (networkData) {
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address);
      this.setState({ socialNetwork });
      const postCount = await socialNetwork.methods.postCount().call();
      this.setState({ postCount });
      // Load Posts
      for (let i = 0; i < postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call();
        this.setState({
          posts: [...this.state.posts, post]
        })
      }

      this.setState({ loading: false });
    } else {
      window.alert('SocialNetwork contract not deployed to detect network.');
    }
  }

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  createPost(content) {
    this.setState({ loading: true });
    this.state.socialNetwork.methods.createPost(content)
      .send({ from: this.state.account }, function(error, transactionHash) {
        if (error) {
          alert(error);
        }
        this.setState({ loading: false });
      }.bind(this));
    // contractAfterCreate.once('receipt', (receipt) => {
    //     this.setState({ loading: false });
    //   });
  }

  tipPost(id, tipAmount) {
    this.setState({ loading: true});
    this.state.socialNetwork.methods.tipPost(id).send({from: this.state.account, value: tipAmount}, function(error, transactionHash) {
      if (error) {
        alert(error.message);
      }
      this.setState({ loading: false });
    }.bind(this));
  }

}

export default App;
