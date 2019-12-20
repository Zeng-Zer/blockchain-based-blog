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

      this.loadData();

      this.setState({ loading: false });
    } else {
      window.alert('SocialNetwork contract not deployed to detect network.');
    }
  }

  async loadData() {
    const postCount = (await this.state.socialNetwork.methods.postCount().call()).toNumber();
    this.setState({ postCount });
    // Load Posts
    const posts = await Promise.all([...Array(postCount).keys()].map((i) => {
      return this.state.socialNetwork.methods.posts(i).call();
    }));
    this.setState({
      posts: posts
    })
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
          alert(error.message);
          this.setState({ loading: false });
        } else {
          this.waitForTransaction(transactionHash, (receipt) => {
            this.loadData().then(() => {
              this.setState({ loading: false });
            });
          });
        }
      }.bind(this));
  }

  tipPost(id, tipAmount) {
    this.setState({ loading: true});
    this.state.socialNetwork.methods.tipPost(id)
      .send({from: this.state.account, value: tipAmount}, function(error, transactionHash) {
        if (error) {
          alert(error.message);
          this.setState({ loading: false });
        } else {
          this.waitForTransaction(transactionHash, (receipt) => {
            this.loadData().then(() => {
              this.setState({ loading: false });
            });
          });
        }
      }.bind(this));
  }

  waitForTransaction(hash, callback) {
    window.web3.eth.getTransactionReceipt(hash, (error, receipt) => {
      if (receipt != null) {
        if (callback) {
          callback(receipt);
        }
      } else {
        window.setTimeout(() => { this.waitForTransaction(hash, callback) }, 100);
      }
    });
  }

}

export default App;
