let offset = 0;
let limit = 10;
const USER_KEY = 'USER_KEY';
const KEYWORD = 'KEYWORD';
let url = window.location.href;
let indexRegex = /\/vote\/index/;//首页的正则
let registerRegex = /\/vote\/register/;//报名页的正则
let searchReg = /\/vote\/search/;//搜索结果页的正则
let detailReg = /\/vote\/detail/;
//把比较长的代码，或者是通用可复用的代码放在此对象里
let voteFn = {
  formatUser(user){
    return `
      <li>
                        <div class="head">
                           <a href="/vote/detail/${user.id}">
                              <img src="${user.head_icon}" alt="">
                           </a>
                        </div>
                        <div class="up">
                           <div class="vote">
                              <span>${user.vote}票</span>
                           </div>
                           <div data-id="${user.id}" class="btn">
                              投TA一票
                           </div>
                        </div>
                        <div class="descr">
                           <a href="detail.html">
                             <div>
                                <span>${user.username}</span>
                                <span>|</span>
                                <span>编号#${user.id}</span>
                              </div>
                              <p>${user.description}</p>
                           </a>
                        </div>
                    </li>
     `
  },//把一个用户对象转成li字符串
  request({url, type = 'GET', dataType = 'json', data, success}){
    $.ajax({
      url,
      type,
      dataType,
      data,
      success
    });
  },
  loadIndexData(){
    voteFn.request({
      url: `/vote/index/data?limit=${limit}&offset=${offset}`,
      success(result){
        offset += limit;
        let users = result.data.objects;
        let html = users.map(voteFn.formatUser).join('');
        $('.coming').html(html);
      }
    })
    loadMore({
      callback(load){
        voteFn.request({
          url: `/vote/index/data?limit=${limit}&offset=${offset}`,
          success(result){
            let total = result.data.total;
            //如果偏移量已经大于等于总条数了表示数据加载完成
            if (offset >= total) {
              load.complete();//让提示框显示数据加载完成
              setTimeout(function () {
                load.reset();//把提示框内容清除
              }, 1000)
            } else {
              let users = result.data.objects;
              let html = users.map(voteFn.formatUser).join('');
              setTimeout(function () {
                $('.coming').append(html);
                load.reset();//把提示框内容清除
              }, 1000);
            }
          }
        });
      }
    });
  },
  initIndex(){//初始化首页代码
      voteFn.loadIndexData();//加载首页数据
      $('.sign_in').click(function () {
        $('.mask').show();
      });
      $('.mask').click(function(event){
        if($(event.target).hasClass('mask')){
          $(this).hide();
        }
      });
      voteFn.bindLogin();//处理登录按钮的点击事件
      voteFn.initLoginUser()//当用户已登录时，修改显示的内容
      voteFn.bindVote();
      $('.search span').click(function () {
        let keyword = $('.search input').val();
        localStorage.setItem(KEYWORD,keyword);
        location = `/vote/search`;
      })
  },
  bindVote(){
    $('.coming').click(function (event) {
      let $element = $(event.target);
      let user = voteFn.getUser();
      if(user){
        let voterId = user.id;//自己的ID，也就是投票者的ID
        let voteId = $element.data('id');
        voteFn.request({
          url:`	/vote/index/poll?id=${voteId}&voterId=${voterId}`,
          success(result){
            if(result.errno  == 0){
              let voteEle = $element.siblings('.vote').children('span');
              voteEle.text(parseInt(voteEle.text())+1+'票');
            }else{
              alert(result.msg);
            }
          }
        })
      }else{
        alert('你尚未登录，请先登录');
        $('.mask').show();
      }
    });
  },
  initLoginUser(){
    let user = voteFn.getUser();
    if(user){
      $('.sign_in span').html('已登入');
      $('.register a').html('个人主页');
      $('.register a').attr('href',`/vote/detail/${user.id}`);
      $('.no_signed').hide();
      $('.username').html(user.username);
      $('.dropout').click(function () {
        voteFn.delUser();
        location.reload();
      });
    }
  },
  bindLogin(){
    $('.subbtn').click(function(){
      let id = $('.usernum').val();
      let password = $('.user_password').val();
      if(!(id &&password)){
        alert('用户名和密码都不能为空');
        return;
      }
      voteFn.request({
        url:'/vote/index/info',
        type:'POST',
        data:{id,password},
        success(result){
          if(result.errno == 0){
            voteFn.setUser(result.user);
            location.reload(true);
          }else{
            alert(result.msg);
          }
        }
      })
    });
  },
  //获取用户提交的数据
  getUserData(){
    let username = $('.username').val();
    let password = $('.initial_password').val();
    let confirm_password = $('.confirm_password').val();
    let mobile = $('.mobile').val();
    let description = $('.description').val();
    let gender = $('input[name="gender"]:checked').val();
    if(!username){
      alert('用户名输入错误');
      return null;
    }
    if(!(/[0-9a-zA-Z]{1,10}/.test(password) && password == confirm_password)){
      alert('密码输入错误');
      return null;
    }
    if(!/1\d{10}/.test(mobile)){
      alert('手机号输入错误');
      return null;
    }
    if(!(description && description.length<=20)){
      alert('个人描述输入错误');
      return null;
    }
    gender = gender==1?'body':'girl';
    return {
      username,
      password,
      mobile,
      description,
      gender
    }
  },
  initRegister(){
    $('.rebtn').click(function () {
      let user = voteFn.getUserData();
      if(user){
        voteFn.request({
          url:'/vote/register/data',
          type:'POST',
          data:user,
          success(result){
            if(result.errno ==0){
              location = '/vote/index';
            }else{
              alert(result.msg);
            }
          }
        })
      }
    });
  },
  getUser(){//从storage中获取用户对象
    return localStorage.getItem(USER_KEY)?JSON.parse(localStorage.getItem(USER_KEY)):null;
  },
  setUser(user){//向storage中写入用户对象
    localStorage.setItem(USER_KEY,JSON.stringify(user));
  },
  delUser(){//从storage清除
    localStorage.removeItem(USER_KEY);
  },
  initSearch(){
     let keyword = localStorage.getItem(KEYWORD);
     voteFn.request({
       url:`/vote/index/search?content=${keyword}`,
       success(result){
         let users = result.data;
         let html = users.map((user)=>{
           return voteFn.formatUser(user);
         }).join('');
         $('.coming').html(html);
         voteFn.bindVote();
       }
     })
  },
  initDetail(){
    let id = /\/vote\/detail\/(\d+)/.exec(url)[1];
    voteFn.request({
      url:`/vote/all/detail/data?id=${id}`,
      success(result){
        let user = result.data;
        let headHtml = `
      <div class="personal">
				<div class="pl">
					<div class="head">
						<img src="${user.head_icon}" alt="">
					</div>
					<div class="p_descr">
						<p>${user.username}</p>
						<p>编号#${user.id}</p>
					</div>
				</div>
				<div class="pr">
					<div class="p_descr pr_descr">
						<p>${user.rank}名</p>
						<p>${user.vote}票</p>
					</div>
				</div>
				<div class="motto">
					${user.description}
				</div>
			</div>
			<div class="home register">
				<a href="/vote/index">
					活动首页
				</a>
			</div>
         `;
        $('.register_header').html(headHtml);

        let friendHtml = user.vfriend.map(function(friend){
          return `
              <li>
              <div class="head">
                  <a href="#"><img src="${friend.head_icon}" alt=""></a>
              </div>
              <div class="up">
                <div class="vote">
                  <span>投了一票</span>
                </div>
              </div>
              <div class="descr">
                  <h3>${friend.username}</h3>
                  <p>编号#${friend.id}</p>
              </div>
          </li>
          `
        }).join('');
        $('.vflist').html(friendHtml);
      }
    })
  }
}
$(function () {
  if(indexRegex.test(url)){
    voteFn.initIndex();
  }else if(registerRegex.test(url)){
    voteFn.initRegister();
  }else if(searchReg.test(url)){
    voteFn.initSearch();
  }else if(detailReg.test(url)){
    voteFn.initDetail()
  }


})
