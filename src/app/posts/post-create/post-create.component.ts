import { Component, OnDestroy, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EventEmitter,Output } from '@angular/core';
import { PostService } from '../post.service';
import { Post } from "../post.model";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
/* @Output() dekoratörü, bileşenlerin dışarıya olaylarını bildirmesi için kullanılan bir bildirim aracıdır.
Bu olayları tetiklemek için de EventEmitter nesnesi kullanılır.  */
@Component({
    selector: 'app-post-create',
    templateUrl:'./post-create.component.html',
    styleUrls:['./post-create.component.css']
})
export class PostCreateComponent implements OnInit,OnDestroy {
  form:FormGroup;
  enteredTitle = "";
  enteredContent = "";
  post: Post;
  isLoading = false;
  private mode = "create";
  private postId: string;
  imagePreview:string;
  private authStatusSub : Subscription;
  
  constructor(
    public postService: PostService,
    public route: ActivatedRoute,
    public authService:AuthService
  ) {}

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(authStatus =>{
      /* authService üzerinden yetkilendirme durumu değişikliklerini dinlemek için kullanılır. 
      Yani, kullanıcı giriş yaparsa veya çıkış yaparsa, bu abone fonksiyonu çalışacaktır. */
        this.isLoading = false;
        /* giriş veya çıkış yaptıysa işlem bitti loading durumda değiliz false yap.  */
      });
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = 
          {
            id: postData._id, 
            title: postData.title, 
            content: postData.content,
            imagePath:postData.imagePath,
            creator:postData.creator
          };
          this.form. setValue({
            title: this.post.title,
            content: this.post.content,
            image:this.post.imagePath
          });
        });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }
  onImagePicked(event : Event){
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image:file});//değer güncelleme
    this.form.get('image').updateValueAndValidity();//değişikliklerin geçerlilik kontrolü
    const reader =new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);//burada file okunur ve onload() olayı tetiklenir.
  }

  onSavePost() {
    if (this.form. invalid) {
    return;
    }
    this. isLoading = true;
    if (this.mode === "create") {
    this.postService.addPost (
      this.form.value.title, 
      this.form.value.content,
      this.form.value.image
      );
    } 
    else {
    this.postService.updatePost (
    this.postId,
    this. form. value.title,
    this.form.value.content,
      this.form.value.image
    );
  }
    this.form.reset();
    }
    ngOnDestroy() {
      this.authStatusSub.unsubscribe();
    }
}