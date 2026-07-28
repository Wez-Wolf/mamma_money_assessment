import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BrazeContentCard } from '@models/braze/braze-content-card';
import { BrazeAltPushContentCard } from '@models/braze/braze-push-content-card';
import { convertToBrazeContentCard } from '@utils/braze/convert-content-card';

@Injectable({ providedIn: 'root' })
export class InboxStateService {
  private readonly router = inject(Router);

  readonly cards = signal<BrazeContentCard[]>([]);
  readonly loading = signal(false);
  readonly unreadCount = computed(() => this.cards().filter(c => !c.viewed).length);

  private dismissedIds = new Set<string>();
  private viewedIds = new Set<string>();

  refreshCards(): void {
    this.loading.set(true);
    const plugin = window.BrazePlugin;
    if (!plugin) { this.loading.set(false); return; }

    plugin.requestContentCardsRefresh();
    plugin.getContentCardsFromServer(
      (cards: Record<string, unknown>[]) => this.processCards(cards),
      () => this.loadCachedCards(),
    );
  }

  loadCachedCards(): void {
    const plugin = window.BrazePlugin;
    if (!plugin) { this.loading.set(false); return; }
    plugin.getContentCardsFromCache((cards: Record<string, unknown>[]) => this.processCards(cards));
  }

  handleCardTap(card: BrazeContentCard): void {
    this.markAsViewed(card.id);
    window.BrazePlugin?.logContentCardClicked(card.id);

    const url = card.url || '/complete';
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      this.router.navigateByUrl(url).catch(() => this.router.navigateByUrl('/complete'));
    }
  }

  logCardImpression(cardId: string): void {
    window.BrazePlugin?.logContentCardImpression(cardId);
  }

  dismissCard(cardId: string): void {
    this.dismissedIds.add(cardId);
    this.cards.update(list => list.filter(c => c.id !== cardId));
    window.BrazePlugin?.logContentCardDismissed(cardId);
  }

  public markAsViewed(cardId: string): void {
    this.viewedIds.add(cardId);
    this.cards.update(list =>
      list.map(c => c.id === cardId ? { ...c, viewed: true } : c)
    );
  }

  public addCardFromPush(raw: Record<string, unknown>): void {
    let card: BrazeContentCard | null = null;

    if (this.isAltFormat(raw)) {
      const converted = convertToBrazeContentCard(raw as BrazeAltPushContentCard);
      if (converted.extras?.type === 'inbox') card = converted;
    } else {
      const rawCard = raw as unknown as BrazeContentCard;
      if (rawCard.extras?.type === 'inbox') card = rawCard;
    }

    if (!card || this.dismissedIds.has(card.id)) return;

    // Don't duplicate if already in list
    this.cards.update(list => {
      if (list.some(c => c.id === card!.id)) return list;
      return [card!, ...list].sort((a, b) => b.created - a.created);
    });
  }

  private processCards(rawCards: Record<string, unknown>[]): void {
    const inboxCards: BrazeContentCard[] = [];
    for (const raw of rawCards) {
      let card: BrazeContentCard | null = null;
      if (this.isAltFormat(raw)) {
        const converted = convertToBrazeContentCard(raw as BrazeAltPushContentCard);
        if (converted.extras?.type === 'inbox') card = converted;
      } else {
        const rawCard = raw as unknown as BrazeContentCard;
        if (rawCard.extras?.type === 'inbox') card = rawCard;
      }
      if (card && !this.dismissedIds.has(card.id)) {
        if (this.viewedIds.has(card.id)) card.viewed = true;
        inboxCards.push(card);
      }
    }
    this.cards.set(inboxCards.sort((a, b) => b.created - a.created));
    this.loading.set(false);
  }

  private isAltFormat(raw: unknown): raw is BrazeAltPushContentCard {
    const r = raw as Record<string, unknown>;
    return typeof r['ca'] === 'number' && typeof r['tt'] === 'string';
  }
}