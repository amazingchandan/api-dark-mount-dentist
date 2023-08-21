import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FileHandle } from '../../../drag-drop.directive';
import { AppService } from '../../../services/app.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-upload-xray',
  templateUrl: './upload-xray.component.html',
  styleUrls: ['./upload-xray.component.scss']
})
export class UploadXrayComponent implements OnInit {
  title = 'ARTI - Uploaded X-Rays';
  public allData: Array<any> = [];
  // dtOptions: DataTables.Settings = {};
  dtOptions: any = {};
  files: FileHandle[] = [];
  private isDtInitialized: boolean = false;
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  showModalBox: boolean = false;
  showContent: boolean;
  public display: any = false;
  baseLink: string = environment.API_HOST;
  public uploadedXray: any;
  myFormData: any;
  myFiles: any;
  apiData: any = {};
  user_eval: any[];
  n: any = 0;
  public subsCancelled: boolean = false;
  public id: any = JSON.parse(localStorage.getItem('userInfo')).id || ''

  constructor(private userService: UserService,
    private spinner: NgxSpinnerService,
    public router: Router,
    public route: ActivatedRoute,
    private appService: AppService,
    private titleService: Title,) {
      titleService.setTitle(this.title);
    }

  userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  fileToUpload: File | null = null;
  user = this.userInfo;
  url: any;
  msg = "";
  hidden: boolean;
  fileStyle = {
    color: "black",
  };

  xRayData: any = [];

  public ngOnInit() {

    this.gettingUserDetails(this.id)

    this.appService.currentApprovalStageMessage.subscribe(msg => {
      // console.log(msg)
    })

    // this.n=0;
    // this.n =this.route.snapshot.paramMap.get('n');

    this.dtOptions = {
      searching: false,
      paging: false,
      bInfo: false,
      // search: true,
      // searching: true,
      language: {
        search: "",
        searchPlaceholder: 'Search ',
      },
      buttons: [{
        sExtends: 'CSV',
        text: 'Download CSV'
      }],
      //paging: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      // ordering: false,
      responsive: true,
      // dom: 'Bfrtip',
      // order: [[0, "date", "desc"]

      // ],
      "columnDefs": [{
        "targets": [1, 2, 3],

        "orderable": false
      }]
    };
    this.route.params.subscribe(
      params => {
        this.n = +params['n'];
        // console.log("nnnnn", this.n)

      });
    this.getAllXrayOfUserById()
    //this.evalBtn();


  }

  gettingUserDetails(id) {
    // // console.log(JSON.parse(localStorage.getItem('userInfo')).id)
    this.userService.getUserRecordById(id).subscribe((res: any) => {
      // // console.log(res.getData[0].subscription_details.end_date, new Date(res.getData[0].subscription_details.end_date).getTime(), Date.now(), new Date('2023/06/14').getTime(),"2023/05/14")
      if (new Date(res.getData[0].subscription_details.end_date).getTime() > Date.now()) {
        // // console.log(this.subsCancelled, true)
        this.subsCancelled = true;
      } else {
        this.subsCancelled = false;
      }
    })
  }

  filesDropped(files: FileHandle[]){
    // // console.log("THIS IS CALLED HERE")
    this.files = files;
    // console.log(this.files, this.files[0].file);
    let allImages: Array<string> = ['png', 'jpg', 'jpeg', 'gif', 'JPG', 'PNG', 'JPEG'];

    if(this.files[0].file.size > 50000000){
      Swal.fire({
        text: 'Image size exceed 50mb.',
        icon: 'warning'
      });
      return false;
    }

    if (allImages.indexOf(this.files[0].file.name.split(".")[1]) === -1) {

      Swal.fire({
        text: 'Only images are allowed',
        icon: 'warning'
      });
      this.fileStyle = {
        color: "transparent",

      }
      return false;

    } else {
      this.fileStyle = {
        color: "black",

      }
      var formData = new FormData();
      formData.append('xray_image', this.files[0].file);
      formData.append('user_id', this.userInfo.id);

      this.myFormData = formData
      this.myFiles = this.files[0].file

      var reader = new FileReader();
      reader.readAsDataURL(this.files[0].file);

      reader.onload = (_event) => {
        this.msg = "";
        this.url = reader.result;
      }
      // console.log(this.url)
      this.hidden = false;
      this.display = true;
    }
  }

  /*  evalBtn(){
      let evaluate = document.getElementById("eval");
  let view = document.getElementById("view");

      let flagged=0;
      if(flagged==0){
        this.hiddenFlag=false;
        this.hiddenunFlag=true;

      }
      else if(flagged==1){
        this.hiddenFlag=true;
        this.hiddenunFlag=false

      }
    }*/
  public open() {
    if (0) {
      // Dont open the modal
      this.showModalBox = false;
    } else {
      // Open the modal
      this.showModalBox = true;
    }

  }
  openModal() {

  }
  backdropModal() {
    this.display = false;
  }
  uploadFile(event: any) {
    // console.log(event)
    // console.log(event.target.files[0], event.target.files[0].size)
    // console.log(event.target.files[0].name.split(".")[1], "type")
    let allImages: Array<string> = ['png', 'jpg', 'jpeg', 'gif', 'JPG', 'PNG', 'JPEG'];

    if(event.target.files[0].size > 50000000){
      Swal.fire({
        text: 'Image size exceed 50mb.',
        icon: 'warning'
      });
      return false;
    }

    if (allImages.indexOf(event.target.files[0].name.split(".")[1]) === -1) {

      Swal.fire({
        text: 'Only images are allowed',
        icon: 'warning'
      });
      this.fileStyle = {
        color: "transparent",

      }
      return false;

    } else {
      this.fileStyle = {
        color: "black",

      }
      var formData = new FormData();
      formData.append('xray_image', event.target.files[0]);
      formData.append('user_id', this.userInfo.id);

      // console.log(event.target.files[0], formData)
      setTimeout(() => {
        localStorage.setItem('file', JSON.stringify(formData))
      }, 1000)
      this.myFormData = formData
      this.myFiles = event.target.files[0]
      //  const formData={
      //    xray_image:event.target.files[0]
      //  }
      // console.log(this.myFiles, this.myFormData)
      // let reader = new FileReader();
      //   if(event.target.files && event.target.files.length > 0) {
      //     let file = event.target.files[0];
      //     reader.readAsDataURL(file);
      //     reader.onload = () => {
      //       this.uploadedXray = reader.result;
      //     };
      //   }

      // this.uploadedXray = event.target.files[0].name
      // this.userService.addXray(formData)
      // .subscribe((res: any) => {
      //   // console.log(res)
      //   if (res.success) {
      //     //this.toastr.success(res.message);
      //     this.xRayData=res.getData;
      //     // const show = document.getElementById('exampleModalCenter')
      //     // // console.log("WORKED", show);
      //     // show.addEventListener('hidden.bs.modal', function(res: any){
      //     //   // console.log("WORKED");
      //     // })
      //     // Swal.fire({
      //     //   text: res.message,
      //     //   icon: 'success',
      //     // });
      //     // this.uploadedXray = res.getData.xray_image.path
      //     // console.log("WORKED", this.display);

      //   } else {
      //     Swal.fire({
      //       text: res.message,
      //       icon: 'error',
      //     });
      //     //this.toastr.error(res.message);
      //   }
      // });

      /* if(!event.target.files[0] || event.target.files[0].length == 0) {
         // Swal.fire({
         //   text: "You must select an image",
         //   icon: 'error',
         // });
         this.msg = 'You must select an image';
         return;
       }

       var mimeType = event.target.files[0].type;

       if (mimeType.match(/image\/*///) == null) {
      // Swal.fire({
      //   text: "Only images are supported",
      //   icon: 'error',
      // });
      /*	this.msg = "Only images are supported";
        return;
      }
  */








      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);

      // reader.onload = function(base64) {
      //   localStorage["file"] = base64;
      // }

      reader.onload = (_event) => {
        this.msg = "";
        localStorage["file"] = _event;
        this.url = reader.result;
        // console.log(this.url, _event)
      }

      this.hidden = false;
      this.display = true;

    }
    /* var myHeaders = new Headers();
   myHeaders.append("Authorization", "Bearer my-secret-auth-token");
   myHeaders.append('Access-Control-Allow-Origin', "*");
   myHeaders.append('Access-Control-Allow-Headers', "*");
   myHeaders.append('Access-Control-Allow-Origin', 'http://localhost:4200');
   var formdata = new FormData();
   formdata.append("image",this.myFiles);

   var requestOptions = {
     method: 'POST',
     headers: myHeaders,
     body: formdata,
     redirect: 'follow'
   };

   fetch("https://admin-scm.blahworks.tech/upload/image", {
     method: 'POST',

     headers: myHeaders,
     body: formdata,
     redirect: 'follow'
   })
     .then(response => response.text())
     .then(result =>{ // console.log(JSON.parse(result));
       this.apiData= result;
       // console.log(this.apiData)
     })
     .catch(error => // console.log('error', error));
   */

  }
  handleSave() {

    var formData = new FormData();
    formData.append('xray_image', this.myFiles);
    formData.append('user_id', this.userInfo.id);
    this.userService.addXray(formData)
      .subscribe((res: any) => {
        // console.log(res)
        if (res.success) {
          //this.toastr.success(res.message);
          this.xRayData = res.getData;
          // const show = document.getElementById('exampleModalCenter')
          // // console.log("WORKED", show);
          // show.addEventListener('hidden.bs.modal', function(res: any){
          //   // console.log("WORKED");
          // })
          // Swal.fire({
          //   text: res.message,
          //   icon: 'success',
          // });
          // this.uploadedXray = res.getData.xray_image.path
          // // console.log("WORKED", this.display);
          this.display = false;
          this.hidden = false;
          this.isDtInitialized = false;
          this.getAllXrayOfUserById()
        } else {
          Swal.fire({
            text: res.message,
            icon: 'error',
          });
          this.display = true;
          //this.toastr.error(res.message);
        }
      });
  }
  getAllXrayOfUserById() {
    this.userService.getUserXrayById(this.userInfo.id).subscribe((res: any) => {
      // console.log(res, "!!!!!!!!!!!!!!!!!!!!!!");
      this.allData = res.getData
      this.showContent = true;
      this.user_eval = this.allData.filter((elem) => {
        return elem.evaluation_status === true;
      });
      // console.log(this.user_eval)
      if (this.isDtInitialized) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          //  this.dtTrigger.next(this.allData);
          //  this.isDtInitialized = true;
          // var p = document.getElementsByClassName("paginate_button current").length;
          // // console.log(p,"ppp")
          this.dtTrigger.next(undefined);
        });
      } else {
        this.isDtInitialized = true;
        this.dtTrigger.next(undefined);
        //  var p = document.getElementsByClassName("paginate_button current");
        // // console.log(p,"ppp")
        //this.dtTrigger.next();
      }
    })
  }
  renderImage(img: any) {
    if (img) {
      // console.log(img, this.baseLink);
      return this.baseLink + img;
    } else {
      return '../assets/images/no-image.jpg';
    }
  }
  evaluate() {
    // [routerLink]="'/evaluate-x-ray'"
    // console.log(this.xRayData._id)
    // let id = this.xRayData._id
    this.router.navigateByUrl('/evaluate-x-ray');
    this.hidden = true;
    this.appService.updateGetUrl(true)
    localStorage.setItem('url', '0')
  }
  view(id) {
    this.router.navigateByUrl('/view-x-ray/' + id)
  }
  // evaluate(){
  //   // [routerLink]="'/evaluate-x-ray'"
  //   // console.log(this.xRayData._id)
  //   let id =this.xRayData._id
  //   this.router.navigateByUrl('/evaluate-x-ray/' + id);
  //  }

  saveNdEval() {
    this.appService.updateApprovalMessage(true)
    // return;
    this.display = false;
    this.hidden = false;
    this.isDtInitialized = false;
    var formData = new FormData();
    formData.append('xray_image', this.myFiles);
    formData.append('user_id', this.userInfo.id);
    this.appService.updateApprovalImage({file: this.myFiles, id: this.userInfo.id})
    localStorage.setItem("marks", JSON.stringify({file: this.myFiles}))
    this.evaluate()
    // console.log(formData, this.myFiles, this.userInfo.id)
    return
    // this.userService.addXray(formData)
    //   .subscribe((res: any) => {
    //     // console.log(res)
    //     if (res.success) {
    //       //this.toastr.success(res.message);
    //       this.xRayData = res.getData;

    //       this.display = false;
    //       this.hidden = false;
    //       this.isDtInitialized = false;
    //       this.getAllXrayOfUserById()
    //       this.evaluate()
    //       // console.log(this.xRayData)
    //     } else {
    //       Swal.fire({
    //         text: res.message,
    //         icon: 'error',
    //       });
    //       this.display = true;
          //this.toastr.error(res.message);
      //   }
      // });
    // localStorage.setItem('formData', JSON.stringify(formData))
    // // console.log(formData, this.myFiles, this.userInfo.id)
  }


}
