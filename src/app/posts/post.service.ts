import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { Post } from "./post.model";
import { environment } from "../../environment/environment";

const BACKEND_URL = environment.apiUrl + "/posts/";
@Injectable({ providedIn: "root" })
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts:Post[],postCount:number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage:number,currentPage:number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    /* burası url oluşturma */
    this.http
      .get<{ message: string; posts: any, maxPosts:number }>(BACKEND_URL + queryParams)
      .pipe(
        map(postData => {
          return {posts:postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator 
            };
          }),
          maxPosts:postData.maxPosts
        };
        })
      )
      .subscribe(transformedPosts => {
        this.posts = transformedPosts.posts;
        this.postsUpdated.next({posts:[...this.posts],
          /* (Observer özelliği) abone olanlara bilgi yayma */
          postCount:transformedPosts.maxPosts});
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
    /* Observable üzerine abone olabilirsiniz ve bir olay meydana geldiğinde bu abonelere bildirim yapabilirsiniz. */
  }

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator:string }>(
      BACKEND_URL + id
    );
  }

  addPost(title: string, content: string, image: File) {
    /* post ekleme */
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.http
      .post<{ message: string; post: Post }>(
        BACKEND_URL,
        postData
        /* postdata verileri url e yazılır */
      )
      .subscribe(responseData => {
        /* kullanıcı post ekledikten sonra (asenkron) olarak ana sayfaya gitsin */
        this.router.navigate(["/"]);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (image instanceof File) {
      /* image tipinin file olup olmadığına göre */
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      /* Eğer image bir string (dosya yolu) gelirse, bu durumda mevcut dosyanın yolu olduğunu varsayabiliriz 
      ve bu bilgiyi Post türünden bir nesne olarak kullanırız. Yani, yeni bir dosya yüklenmesi beklenmeyen durumlarda, 
      sadece dosya yolu kullanılarak güncelleme yapılabilir. */
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator:null
      };
    }
  
    this.http
      .put(BACKEND_URL + id, postData)
      .subscribe(response => {
        this.router.navigate(["/"]);
      });
  }


  deletePost(postId: string) {
    return this.http
      .delete(BACKEND_URL + postId)
      }
  }
