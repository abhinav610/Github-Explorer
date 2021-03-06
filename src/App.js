import React from 'react';
import Search from "./components/Search";
import UserCard from "./components/UserCard";
import RepoCard from "./components/RepoCard";

import './App.css';

//const PAGE_SIZE = 10;

class App extends React.Component{
  state = {
    user: null,
    repos: [],
    userDataError: null,
    reposError: null,
    loading: false,
    pageSize: 10,
    page: 1,
  };

  fetchUserData = async (username) => {
       //this request returns a promise:
       // fetch github api::
       const res = await  fetch(`https://api.github.com/users/${username}`);
       if(res.ok){
         const data = await res.json();
         return {data};
       }
       const error = (await res.json()).message;
       return {error};
  };

  fetchRepos = async (username) => {
      const {pageSize,page} = this.state;
      const res = await fetch(`https://api.github.com/users/${username}/repos?page=${page}&per_page=${pageSize}`);
      if(res.ok){
        const data = await res.json();
        return {data};
      }
      const error = (await res.json()).message;
      return {error};
  };

  fetchData = async (username) => {
     this.setState({loading:true},async () => {
      try{
        //when both of the promises are resolved then it is resolved:
        //it returns an array of promises:
       const [user,repos] = await Promise.all([
           this.fetchUserData(username),
           this.fetchRepos(username)
        ]);

       if(user.data!=undefined && repos.data!=undefined){
         return this.setState({
           user: user.data,
           repos: repos.data,
           loading: false,
         })
       }
       this.setState({
         userDataError: user.error,
         reposError: repos.error,
         loading: false,
       });
      }
      catch(err){
         this.setState({
           error: 'there was some error',
           loading: false,
         });
      }
     });
      
  };

  loadPage = async () => {
      const {data} = await this.fetchRepos(
        this.state.user.login,
        this.state.page);
      if(data){
        this.setState((state) => ({
          repos: data,
        }));
      }
  };

  handlePageChange = (page) => {
    this.setState({page} , () => this.loadPage());
  };

  handlePageSizeChange = (e) => this.setState({
     pageSize: e.target.value,
  },
  () => this.loadPage(),
  );

  render(){
    const {userDataError ,reposError, loading ,user,repos,page,pageSize } = this.state;
    const renderRepo = !loading && !reposError && !!repos.length;

    return (
      <div>
       <Search fetchData={this.fetchData}/>
      <div className="container">
          <div className="text-center pt-5">
            {loading && <p>Loading...</p>}
            {userDataError && <p className="text-danger">{userDataError}</p>}
          </div>

          {!loading && !userDataError && user && <UserCard user={user} />}
          {reposError && <p className="text-danger">{reposError}</p>}
          
          {renderRepo && (
          <React.Fragment>
            <div className = "mb-4">
              {[...new Array(Math.ceil(user.public_repos / pageSize))].map
              ((_,index) => (
              <button key ={index} className = "btn btn-success mr-2" 
                onClick = {() => this.handlePageChange(index+1)}>
                {index+1}
              </button>
                ),
              )}
            </div>

            <div className ="d-inline-block mb-4">
              <select className = "form-control" 
                value ={pageSize}
                onChange = {this.handlePageSizeChange}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
              </select>
            </div>

            {repos.map
            (repo => <RepoCard key = {repo.id} repo = {repo} />
            )} 
          </React.Fragment>
          )}
       </div>
    </div>
    );
    
  }
}

export default App;
