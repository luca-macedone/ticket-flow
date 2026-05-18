import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Comment, CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../toast/toast-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectField, SelectOption } from '../fields/select-field/select-field';
import { firstValueFrom } from 'rxjs';
import { BaseCard } from '../overview-cards/base-card/base-card';
import { TextareaField } from '../fields/textarea-field/textarea-field';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ticket-comments',
  imports: [BaseCard, TextareaField, SelectField, ReactiveFormsModule, DatePipe],
  templateUrl: './ticket-comments.html',
  styleUrl: './ticket-comments.css',
})
export class TicketComments implements OnInit {
  ticketCode = input.required<string>();

  private commentService = inject(CommentService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  comments = signal<Comment[]>([]);
  loading = signal(true);
  submitting = signal(false);

  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isAgent = computed(() => this.auth.user()?.role === 'agent');
  canSeeInternal = computed(() => this.isAdmin() || this.isAgent());

  commentForm = new FormGroup({
    content: new FormControl('', [Validators.required, Validators.maxLength(2000)]),
    visibility: new FormControl<'PUBLIC' | 'INTERNAL'>('PUBLIC'),
  })


  readonly visibilityOptions: SelectOption[] = [
    { value: 'PUBLIC', label: 'Public' },
    { value: 'INTERNAL', label: 'Internal (agents only)' },
  ];

  get contentControl() { return this.commentForm.controls.content; }
  get visibilityControl() { return this.commentForm.controls.visibility; }

  async ngOnInit() {
    await this.loadComments();
  }

  async loadComments() {
    try {
      this.loading.set(true);
      const res = await firstValueFrom(this.commentService.getComments(this.ticketCode()));
      this.comments.set(res.data);
    } catch {
      this.toast.error('Failed to load comments.');
    } finally {
      this.loading.set(false);
    }
  }

  async submit() {
    if (this.contentControl.invalid || this.submitting()) return;
    this.submitting.set(true);
    try {
      const visibility = this.canSeeInternal()
        ? (this.visibilityControl.value ?? 'PUBLIC')
        : 'PUBLIC';
      const res = await firstValueFrom(
        this.commentService.addComment(this.ticketCode(), {
          content: this.contentControl.value!,
          visibility,
        })
      );
      this.comments.update(c => [...c, res.data]);
      this.contentControl.reset();
      this.visibilityControl.setValue('PUBLIC');
      this.toast.success('Comment added.');
    } catch {
      this.toast.error('Failed to add comment.');
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteComment(comment: Comment) {
    try {
      await firstValueFrom(this.commentService.deleteComment(this.ticketCode(), comment.id));
      this.comments.update(c => c.filter(x => x.id !== comment.id));
      this.toast.success('Comment deleted.');
    } catch {
      this.toast.error('Failed to delete comment.');
    }
  }

  canDelete(comment: Comment): boolean {
    if (this.isAdmin()) return true;
    const userCode = this.auth.user()?.userCode;
    return comment.visibility === 'PUBLIC'
      && !!userCode
      && comment.author.userCode === userCode;
  }

}
