import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  editPageForm: FormGroup;
  newPage: boolean = true;
  pending: boolean = true;
  slug: string;

  constructor(private formBuilder: FormBuilder,
              private db: AngularFirestore,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
		this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) {
        this.initNewPage();
      } else {
        this.initEditPage(slug);
      }
    });
  }

  initNewPage() {
    this.newPage = true;
    this.pending = false;
    this.editPageForm = this.formBuilder.group({
      slug: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  initEditPage(slug) {
    const doc = this.db.collection('pages').doc(slug).get();
    const subs = doc.subscribe((snapshot) => {
      const page = snapshot.data();
      if (!page) {
        this.initNewPage();
      } else {
        this.editPageForm = this.formBuilder.group({
          content: [page.content, Validators.required]
        });
        this.newPage = false;
        this.pending = false;
        this.slug = slug;
      }
      subs.unsubscribe();
    });
  }

  savePage() {
    if (!this.editPageForm.valid) return;
    const now = Date.now();
    let slug, document;
    if (this.newPage) {
      slug = this.editPageForm.get('slug').value;
      document = {
        content: this.editPageForm.get('content').value,
        modified: now,
        created: now
      }
    } else {
      slug = this.slug;
      document = {
        content: this.editPageForm.get('content').value,
        modified: now
      }
    }
    this.db.collection('pages').doc(slug).set(document, {merge: true}).then(() => {
      this.router.navigate(['/home', slug]);
    });
  }
}
