from enum import Enum


class OrderStatus(str, Enum) :
    PREPARATION = 'PREPARATION'
    PRET = 'PRET'
    CONSOMEE = 'CONSOMEE'
    
