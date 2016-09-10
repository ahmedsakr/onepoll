from django.conf.urls import url
from django.contrib import admin

from . import views

app_name = 'polls'
urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^random/$', views.random, name='random'),
    url(r'^(?P<question_id>[0-9]+)/$', views.detail, name='detail'),
    url(r'^public/$', views.public, name='public'),
    url(r'^(?P<question_id>[0-9]+)/results/$', views.results, name='results'),
    url(r'^(?P<question_id>[0-9]+)/vote/$', views.vote, name='vote'),
    url(r'^new/$', views.new, name='new'),
    url(r'^new/submit/$', views.submit, name='submit'),
]
