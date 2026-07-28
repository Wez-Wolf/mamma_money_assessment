interface BrazePlugin {                                                                                                                                                 
    logCustomEvent(name: string): void;                                                                                                                                   
    requestImmediateDataFlush(): void;                                                                                                                                    
    requestContentCardsRefresh(): void;                                                                                                                                   
    getContentCardsFromServer(                                                                                                                                            
    success: (cards: Record<string, unknown>[]) => void,                                                                                                                
    error?: () => void,                                                                                                                                                 
    ): void;                                                                                                                                                              
    getContentCardsFromCache(success: (cards: Record<string, unknown>[]) => void): void;                                                                                  
    logContentCardDismissed(cardId: string): void;                                                                                                                        
    logContentCardClicked(cardId: string): void;                                                                                                                          
    logContentCardImpression(cardId: string): void;                                                                                                                       
}

interface Window {                                                                                                                                                      
    BrazePlugin?: BrazePlugin;                                                                                                                                            
} 