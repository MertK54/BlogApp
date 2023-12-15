import { Component,OnDestroy, OnInit } from "@angular/core";
import { Post } from "../post.model";
import { PostService } from "../post.service";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "src/app/auth/auth.service";
@Component({
    selector:'app-post-list',
    templateUrl:'./post-list.component.html',
    styleUrls:['./post-list.component.css']
})
//RCV3GCB16cPwpNWe
export class PostListComponent implements OnInit,OnDestroy
{
    posts:Post[] =[];
    isLoading = false;
    totalPosts = 0;
    postsPerPage=2;
    currentPage = 1;
    userId:string;
    pageSizeOption = [1,2,5,10];
    userIsAuthenticated = false;
    private postsSub:Subscription;
    private authStatusSub:Subscription;

    constructor (public postService:PostService, private authService:AuthService)
    {
        //public yazdığımızda postService değişkeni oluşturur ve const. çağrıldığında gelen veri postService' de tutulur.
    }
    ngOnInit() {//bileşen oluştuğunda çalışır.
        this.isLoading = true;
        this.postService.getPosts(this.postsPerPage,this.currentPage);
        this.userId = this.authService.getUserId();
        this.postsSub = this.postService.getPostUpdateListener()
        .subscribe((postData: {posts: Post [], postCount: number}) =>
            {
            this.isLoading = false;
            this.totalPosts = postData.postCount;
            this.posts = postData.posts;
            });
            this.userIsAuthenticated = this.authService.getIsAuth();
            this.authStatusSub = this.authService
            .getAuthStatusListener()
            .subscribe(userIsAuthenticated =>{
                this.userIsAuthenticated=userIsAuthenticated;
                this.userId = this.authService.getUserId();
            });
        }

    onChangedPage (pageData: PageEvent) {
        this.isLoading = true;
        this.currentPage = pageData. pageIndex + 1;
        this.postsPerPage = pageData. pageSize;
        this.postService.getPosts(this.postsPerPage,this.currentPage);
        }

        onDelete(postId: string) {
            this.isLoading = true;
            this.postService.deletePost(postId).subscribe({
              next: () => {
                this.postService.getPosts(this.postsPerPage, this.currentPage);
              },
              error: () => {
                this.isLoading = false;
              }
            });
          }
          

    ngOnDestroy(): void {
        this.postsSub.unsubscribe();
        this.authStatusSub.unsubscribe();
    }
}