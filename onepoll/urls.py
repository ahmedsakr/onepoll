from django.conf.urls import url
from django.contrib import admin

from . import views

app_name = 'polls'
urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.view_index, name='index'),
    url(r'^register/$', views.view_register, name='register'),
    url(r'^random/$', views.view_random, name='random'),
    url(r'^public/$', views.view_public, name='public'),
    url(r'^new/$', views.view_new, name='new'),
    url(r'^new/submit/$', views.view_submit, name='submit'),
    url(r'^p/(?P<pid>[0-9a-zA-Z]+)/$', views.view_detail, name='detail'),
    url(r'^p/(?P<pid>[0-9a-zA-Z]+)/results/$', views.view_results, name='results'),
    url(r'^p/(?P<pid>[0-9a-zA-Z]+)/vote/$', views.view_vote, name='vote'),
]
