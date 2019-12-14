pragma solidity ^0.5.0;

contract SocialNetwork {

    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }

    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    mapping(uint => Post) public posts;
    uint public postCount = 0;

    string public name;

    constructor() public {
        name = "Blockchain Based Blog";
    }

    function createPost(string memory _content) public {
        require(bytes(_content).length > 0);

        posts[postCount] = Post(postCount, _content, 0, msg.sender);
        emit PostCreated(postCount, _content, 0, msg.sender);
        postCount++;
    }

    function tipPost(uint _id) public payable {
        require(_id < postCount);

        Post memory _post = posts[_id];
        address payable _author = _post.author;
        address(_author).transfer(msg.value);
        _post.tipAmount += msg.value;
        posts[_id] = _post;
        emit PostTipped(_post.id, _post.content, _post.tipAmount, _author);
    }
}
