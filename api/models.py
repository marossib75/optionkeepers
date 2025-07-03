from django.db import models

class Strategia(models.Model):
    nome = models.CharField(max_length=100)
    ticker = models.CharField(max_length=10)
    data_creazione = models.DateTimeField(auto_now_add=True)
    opzioni_json = models.JSONField()  # salvare opzioni come array JSON

    def __str__(self):
        return self.nome
